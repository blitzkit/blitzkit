import type { GetStaticPaths } from "astro";
import { isChunkEnabled } from "../../astro/isChunkEnabled";

export const getStaticPaths = (() => {
  if (!isChunkEnabled("api")) return [];
  return [{ params: { api: "api" } }];
}) satisfies GetStaticPaths;
