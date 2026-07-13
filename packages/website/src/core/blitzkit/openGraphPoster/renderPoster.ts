import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { loadPosterFonts } from "./fonts";

export const POSTER_WIDTH = 1200;
export const POSTER_HEIGHT = 630;

/**
 * Rasterizes a satori-compatible JSX element (flexbox + a CSS subset only,
 * see https://github.com/vercel/satori#documentation) into a PNG buffer.
 * This is the same satori -> resvg pipeline @vercel/og wraps, used directly
 * as a plain library here since blitzkit has no live server to run
 * @vercel/og's per-request Vercel Function on: the site builds statically
 * through Astro, so this runs once per tank at build time instead.
 */
export async function renderPoster(element: React.JSX.Element): Promise<Buffer> {
  const fonts = await loadPosterFonts();
  const svg = await satori(element, {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    fonts,
  });

  return new Resvg(svg).render().asPng();
}
