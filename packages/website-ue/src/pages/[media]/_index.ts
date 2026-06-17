import type { GetStaticPaths } from "astro";
import { isChunkEnabled } from "../../astro/isChunkEnabled";

export const getStaticPaths = (() => {
  if (!isChunkEnabled("media")) return [];
  return [{ params: { media: "media" } }];
}) satisfies GetStaticPaths;
