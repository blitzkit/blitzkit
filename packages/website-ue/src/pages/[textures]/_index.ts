import type { GetStaticPaths } from "astro";
import { isChunkEnabled } from "../../astro/isChunkEnabled";

export const getStaticPaths = (() => {
  if (!isChunkEnabled("textures")) return [];
  return [{ params: { textures: "textures" } }];
}) satisfies GetStaticPaths;
