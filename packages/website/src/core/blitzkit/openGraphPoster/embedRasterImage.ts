import sharp from "sharp";

const cache = new Map<string, Buffer>();

export interface EmbedRasterImageOptions {
  grayscale?: boolean;
  /**
   * Upscales/crops to this size with sharp (lanczos3, sharp's default
   * resize kernel) before handing the raster off to satori/resvg. Tank
   * icons are natively as small as 137x100, so leaving that scaling to
   * resvg's SVG image compositing looks noticeably softer than resizing
   * with a proper kernel and sharpening ourselves first.
   */
  resize?: { width: number; height: number };
}

/**
 * Fetches a remote image and inlines it as a base64 PNG data URI so satori
 * can embed it directly, mirroring packages/bot/src/core/blitzkit/iconPng.ts.
 * Re-encoding to PNG sidesteps webp support gaps in the resvg SVG renderer.
 */
export async function embedRasterImage(
  url: string,
  { grayscale = false, resize }: EmbedRasterImageOptions = {},
): Promise<string> {
  const cacheKey = `${grayscale}:${resize?.width}x${resize?.height}:${url}`;
  const cached = cache.get(cacheKey);

  if (cached) return toDataUri(cached);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image for opengraph poster: ${url}`);
  }

  const sourceBuffer = Buffer.from(await response.arrayBuffer());
  let pipeline = sharp(sourceBuffer);

  if (resize) {
    pipeline = pipeline.resize(resize.width, resize.height, { fit: "cover" });
  }

  if (grayscale) pipeline = pipeline.grayscale();

  const pngBuffer = await pipeline.sharpen({ sigma: 1.3 }).png().toBuffer();

  cache.set(cacheKey, pngBuffer);

  return toDataUri(pngBuffer);
}

function toDataUri(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
