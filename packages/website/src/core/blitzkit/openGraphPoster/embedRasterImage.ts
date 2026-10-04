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
 * Fetches a remote image (or accepts already-read bytes) and inlines it as
 * a base64 PNG data URI so satori can embed it directly, mirroring
 * packages/bot/src/core/blitzkit/iconPng.ts. Re-encoding to PNG sidesteps
 * webp support gaps in the resvg SVG renderer.
 *
 * Accepts raw bytes directly (skipping the fetch) for callers reading
 * straight from the VFS - fetching a `/api/...`-style alias URL from
 * server-side build code has no origin to resolve against and isn't
 * fetchable cross-chunk during a static build anyway.
 */
export async function embedRasterImage(
  source: string | Uint8Array,
  { grayscale = false, resize }: EmbedRasterImageOptions = {},
): Promise<string> {
  const cacheKey =
    typeof source === "string"
      ? `${grayscale}:${resize?.width}x${resize?.height}:${source}`
      : undefined;
  const cached = cacheKey && cache.get(cacheKey);

  if (cached) return toDataUri(cached);

  const sourceBuffer =
    typeof source === "string"
      ? Buffer.from(await fetchBytes(source))
      : Buffer.from(source);
  let pipeline = sharp(sourceBuffer);

  if (resize) {
    pipeline = pipeline.resize(resize.width, resize.height, { fit: "cover" });
  }

  if (grayscale) pipeline = pipeline.grayscale();

  const pngBuffer = await pipeline.sharpen({ sigma: 1.3 }).png().toBuffer();

  if (cacheKey) cache.set(cacheKey, pngBuffer);

  return toDataUri(pngBuffer);
}

async function fetchBytes(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image for opengraph poster: ${url}`);
  }

  return response.arrayBuffer();
}

function toDataUri(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
