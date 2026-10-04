import type { AstroIntegration } from "astro";
import { closeSharedArmorPosterRenderer } from "../core/blitzkit/armorPoster/sharedRenderer";

/**
 * Closes the shared WebGPU armor-poster renderer once every route -
 * including dynamic `getStaticPaths` ones - has been generated.
 * `astro:build:done` fires only after generation is fully done, so this is
 * safe: https://docs.astro.build/en/reference/integrations-reference/
 *
 * The renderer is created lazily by `getSharedArmorPosterRenderer` on the
 * first real render() call rather than pre-warmed on `astro:build:start`.
 */
export function armorPosterRendererIntegration(): AstroIntegration {
  return {
    name: "armor-poster-renderer",
    hooks: {
      "astro:build:done": async () => {
        await closeSharedArmorPosterRenderer();
      },
    },
  };
}
