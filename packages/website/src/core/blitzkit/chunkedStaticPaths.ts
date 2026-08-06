import { assertSecret } from "@blitzkit/core";
import type { GetStaticPaths } from "astro";

export function chunkedStaticPaths(chunk: string) {
  return function () {
    const chunksEnv = assertSecret(import.meta.env.CHUNK);
    const chunks = chunksEnv.split(",");

    if (chunksEnv !== "*" && !chunks.includes(chunk)) {
      return [];
    }

    return [{ params: { [`chunk_${chunk}`]: chunk } }];
  } satisfies GetStaticPaths;
}
