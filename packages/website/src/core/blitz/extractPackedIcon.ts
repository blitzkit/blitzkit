import type sharp from "sharp";

export async function extractPackedIcon(texture: sharp.Sharp, sizes: number[]) {
  const [left, top, width, height] = sizes;
  const bounds = [left, top, width, height];

  if (!bounds.every(Number.isInteger)) {
    throw new Error(`Invalid RIFF sprite bounds: ${bounds.join(" ")}`);
  }

  const metadata = await texture.metadata();

  if (metadata.width === undefined || metadata.height === undefined) {
    throw new Error(`Failed to read image dimensions`);
  }

  if (
    left < 0 ||
    top < 0 ||
    width <= 0 ||
    height <= 0 ||
    left + width > metadata.width ||
    top + height > metadata.height
  ) {
    throw new Error(
      `Out-of-bounds RIFF sprite: ${bounds.join(" ")} in ${metadata.width}x${metadata.height}`,
    );
  }

  return await texture.clone().extract({ left, top, width, height }).toBuffer();
}
