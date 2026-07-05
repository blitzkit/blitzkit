import type { GetStaticPaths } from "astro";
import { isChunkEnabled } from "../../astro/isChunkEnabled";

// TODO: maybe consider abstracting this away?
export const getStaticPaths = (() => {
  if (!isChunkEnabled("models")) return [];
  return [{ params: { models: "models" } }];
}) satisfies GetStaticPaths;
