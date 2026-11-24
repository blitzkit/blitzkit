export function Cache(disableInDev = false) {
  const cache = new WeakMap<object, Map<string, Promise<unknown>>>();

  return function <This, Arguments extends any[], Return>(
    target: (this: This, ...args: Arguments) => Promise<Return>
    // TODO: evaluate if we need context to make the error trace easier
    // context: ClassMethodDecoratorContext<
    //   This,
    //   (this: This, ...args: Arguments) => Promise<Return>
    // >,
  ) {
    return async function replacementMethod(this: This, ...args: Arguments) {
      const key = args.join("-");
      let thisCache: Map<string, Promise<Return>>;

      if (cache.has(this as object)) {
        thisCache = cache.get(this as object) as Map<string, Promise<Return>>;
      } else {
        thisCache = new Map();
        cache.set(this as object, thisCache);
      }

      const disabled = disableInDev && import.meta.env.DEV;

      if (thisCache.has(key) && !disabled) {
        return thisCache.get(key)!;
      }

      const promise = (async () => {
        try {
          return await target.apply(this, args);
        } catch (error) {
          thisCache!.delete(key);
          throw error;
        }
      })();

      thisCache.set(key, promise);

      return promise;
    };
  };
}
