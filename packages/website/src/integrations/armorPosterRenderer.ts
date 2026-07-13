import type { AstroIntegration } from "astro";
import {
  closeSharedArmorPosterRenderer,
  getSharedArmorPosterRenderer,
} from "../core/blitzkit/armorPoster/sharedRenderer";

/**
 * Pre-warms the shared Puppeteer/WebGL armor-poster renderer before static
 * routes start generating (`opengraph/tanks/[slug].png.ts` builds ~700+ of
 * them), and closes it once every route - including dynamic
 * `getStaticPaths` ones - has been generated. `astro:build:start` fires
 * before generation begins and `astro:build:done` fires only after it's
 * fully done, so this is safe: https://docs.astro.build/en/reference/integrations-reference/
 */
export function armorPosterRendererIntegration(): AstroIntegration {
  return {
    name: "armor-poster-renderer",
    hooks: {
      "astro:build:start": async () => {
        await getSharedArmorPosterRenderer();
      },
      "astro:build:done": async () => {
        await closeSharedArmorPosterRenderer();
      },
    },
  };
}
