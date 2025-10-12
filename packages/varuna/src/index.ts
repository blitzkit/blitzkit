import { produce } from "immer";
import { debounce, merge } from "lodash-es";
import { useEffect, useRef, useState } from "react";

export class Varuna<Type, Arguments = void> {
  private listeners = new Set<(state: Type) => void>();

  private initialized = false;
  private _initial?: Type;
  private _state?: Type;

  constructor(
    private creator: Type | ((...args: Arguments[]) => Type),
    private persistence?: string
  ) {
    if (typeof creator !== "function") this.initialize(creator);
  }

  private initialize(initial: Type) {
    let data = initial;

    if (this.persistence && typeof localStorage !== "undefined") {
      const dehydrated = localStorage.getItem(this.persistence);

      if (dehydrated) {
        const rehydrated = JSON.parse(dehydrated) as unknown;
        data = merge(data, rehydrated);
      }

      window.addEventListener("beforeunload", this.store.bind(this));
    }

    this.initialized = true;
    this._initial = data;
    this._state = data;
  }

  useInitialization(...args: Arguments[]) {
    const initializedThisMount = useRef(false);

    if (initializedThisMount.current) return;

    if (typeof this.creator !== "function") {
      throw new Error("Provider must be used with a function creator");
    }

    this.initialize((this.creator as (...args: Arguments[]) => Type)(...args));
    initializedThisMount.current = true;
  }

  private dispatch() {
    const state = this.state;
    this.listeners.forEach((callback) => callback(state));
  }

  on<Slice>(slicer: (state: Type) => Slice, callback: (state: Slice) => void) {
    let last = slicer(this.state);

    function listener(state: Type) {
      const next = slicer(state);

      if (next !== last) {
        callback(next);
        last = next;
      }
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  mutate(mutator: (state: Type) => void) {
    this.set(produce(this.state, mutator));
  }

  private assertInitialized() {
    if (!this.initialized) {
      throw new Error("Varuna store used before initialization");
    }
  }

  get state() {
    this.assertInitialized();
    return this._state as Type;
  }

  set(state: Type) {
    this.assertInitialized();
    this._state = state;
    this.dispatch();
    this.storeDeferred();
  }

  get initial() {
    this.assertInitialized();
    return this._initial as Type;
  }

  use<Slice = Type>(
    slicer: (state: Type) => Slice = (state) => state as unknown as Slice
  ) {
    return this.useDeferred(slicer, slicer(this.state));
  }

  useDeferred<Slice = Type>(slicer: (state: Type) => Slice, initial: Slice) {
    const instance = this;
    const [slice, setSlice] = useState(initial);

    useEffect(() => {
      setSlice(slicer(instance.state));
      return instance.on(slicer, setSlice);
    }, []);

    return slice;
  }

  store() {
    localStorage.setItem(this.persistence!, JSON.stringify(this.state));
  }

  storeDeferred = debounce(this.store.bind(this), 500);
}
