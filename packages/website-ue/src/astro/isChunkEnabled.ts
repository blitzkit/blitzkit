import { assertSecret } from "@blitzkit/core";

export function isChunkEnabled(chunk: string) {
  const buildChunk = assertSecret(import.meta.env.BUILD_CHUNK);
  return [chunk, "*"].includes(buildChunk);
}
