import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

export interface PosterFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}

/** Matches the fallback chain every poster element sets as its fontFamily. */
export const POSTER_FONT_FAMILY = "Inter, Inter Latin Ext, Noto Sans SC";

const require = createRequire(import.meta.url);
const POSTER_FONT_WEIGHTS = [400, 700] as const;

let fontsPromise: Promise<PosterFont[]> | undefined;

/**
 * Loads the fonts satori needs to render every tank's name - it can't use
 * @font-face/system fonts and needs font data supplied directly.
 *
 * satori resolves a missing glyph by walking the CSS `font-family` list and
 * trying the next *distinctly-named* font entry - two entries sharing one
 * `name` do NOT merge their glyph coverage (verified empirically: stacking
 * a second same-named entry for a subset the first doesn't cover still
 * renders "no glyph" tofu). So each subset needs its own name here, and
 * POSTER_FONT_FAMILY lists them in fallback order:
 *  - "Inter" (latin subset) - the site's own font, covers the vast
 *    majority of tank names.
 *  - "Inter Latin Ext" (Inter's latin-ext subset, same @fontsource/inter
 *    package) - Latin Extended-A/B letters a handful of tanks need (e.g.
 *    Škoda, "NC 70 Błyskawica").
 *  - "Noto Sans SC" - a few tank names (e.g. "星际猎人") keep literal CJK
 *    characters even in the English locale, and Inter has no CJK glyphs in
 *    any subset.
 */
export function loadPosterFonts() {
  fontsPromise ??= Promise.all([
    ...POSTER_FONT_WEIGHTS.map(async (weight): Promise<PosterFont> => {
      const path = require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`);
      return { name: "Inter", data: await readFile(path), weight, style: "normal" };
    }),
    ...POSTER_FONT_WEIGHTS.map(async (weight): Promise<PosterFont> => {
      const path = require.resolve(
        `@fontsource/inter/files/inter-latin-ext-${weight}-normal.woff`,
      );
      return { name: "Inter Latin Ext", data: await readFile(path), weight, style: "normal" };
    }),
    ...POSTER_FONT_WEIGHTS.map(async (weight): Promise<PosterFont> => {
      const path = require.resolve(
        `@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-${weight}-normal.woff`,
      );
      return { name: "Noto Sans SC", data: await readFile(path), weight, style: "normal" };
    }),
  ]);

  return fontsPromise;
}
