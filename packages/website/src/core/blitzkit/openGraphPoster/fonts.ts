import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

export interface PosterFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}

const require = createRequire(import.meta.url);
const POSTER_FONT_WEIGHTS = [400, 700] as const;

let fontsPromise: Promise<PosterFont[]> | undefined;

/**
 * Loads Inter (the site's own font, via the already-installed
 * @fontsource/inter package) as raw woff bytes for satori, which can't use
 * @font-face/system fonts and needs font data supplied directly.
 */
export function loadPosterFonts() {
  fontsPromise ??= Promise.all(
    POSTER_FONT_WEIGHTS.map(async (weight): Promise<PosterFont> => {
      const path = require.resolve(
        `@fontsource/inter/files/inter-latin-${weight}-normal.woff`,
      );

      return { name: "Inter", data: await readFile(path), weight, style: "normal" };
    }),
  );

  return fontsPromise;
}
