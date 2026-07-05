import { notFoundResponse } from "./responses";

const cache = new Map<string, Uint8Array<ArrayBuffer>>();

export function bufferProxy(cook: () => number[], key: string) {
  let array = cache.get(key);

  if (array === undefined) {
    const bytes = cook();
    array = new Uint8Array(bytes);

    if (import.meta.env.DEV) {
      cache.set(key, array);
    }
  }

  if (array.length === 0) return notFoundResponse;

  return new Response(array);
}
