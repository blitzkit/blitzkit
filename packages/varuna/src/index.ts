import { produce } from 'immer';
import { merge } from 'lodash-es';
import { useEffect, useState } from 'react';

export class Varuna<Type> {
  private listeners = new Set<(state: Type) => void>();
  public initial: Type;

  constructor(
    public state: Type,
    persistence?: string,
  ) {
    if (persistence) {
      const dehydrated = localStorage.getItem(persistence);

      if (dehydrated) {
        const rehydrated = JSON.parse(dehydrated) as unknown;
        this.state = merge(this.state, rehydrated);
      }
    }

    this.initial = this.state;
  }

  private dispatch() {
    const state = this.state;
    this.listeners.forEach((callback) => callback(state));
  }

  on<Slice>(slicer: (state: Type) => Slice, callback: (state: Slice) => void) {
    const last = slicer(this.state);

    function listener(state: Type) {
      const next = slicer(state);
      if (next !== last) callback(next);
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  mutate(mutator: (state: Type) => void) {
    this.state = produce(this.state, mutator);
    this.dispatch();
  }

  use<Slice>(slicer: (state: Type) => Slice) {
    const [slice, setSlice] = useState(slicer(this.state));
    useEffect(() => this.on(slicer, setSlice), []);
    return slice;
  }
}
