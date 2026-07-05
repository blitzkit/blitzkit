import { use } from "react";

const cache = new Map<string, Promise<unknown>>();

export function useAwait<Type>(
  creator: () => Promise<Type>,
  discriminator: string
) {
  let promise;

  if (cache.has(discriminator)) {
    promise = cache.get(discriminator) as Promise<Type>;
  } else {
    promise = creator();
    cache.set(discriminator, promise);
  }

  return use(promise);
}
