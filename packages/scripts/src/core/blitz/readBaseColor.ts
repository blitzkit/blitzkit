import sharp from "sharp";
import { readTexture } from "./readTexture";

export async function readBaseColor(path: string, occlusionPath?: string) {
  let hasAlpha = false;
  const baseRaw = await readTexture(path);
  const occlusionRaw = occlusionPath
    ? await readTexture(occlusionPath)
    : undefined;
  const base = await sharp(baseRaw.data, { raw: baseRaw }).raw().toBuffer();
  const occlusion = occlusionRaw
    ? await sharp(occlusionRaw.data, { raw: occlusionRaw })
        .extractChannel(3)
        .raw()
        .toBuffer()
    : undefined;

  const combined = Buffer.alloc(baseRaw.width * baseRaw.height * 4);

  for (let i = 0; i < baseRaw.width * baseRaw.height; i++) {
    let c = 1;

    if (occlusionRaw) {
      const x = i % baseRaw.width;
      const y = Math.floor(i / baseRaw.width);
      const u = Math.floor(x * (occlusionRaw.width / baseRaw.width));
      const v = Math.floor(y * (occlusionRaw.height / baseRaw.height));

      const occlusionI = u + v * occlusionRaw.width;

      c = occlusion![occlusionI] / 255;
    }

    const alpha = base[i * 4 + 3];
    hasAlpha ||= alpha < 255;

    combined[i * 4 + 0] = Math.round(base[i * 4 + 0] * c);
    combined[i * 4 + 1] = Math.round(base[i * 4 + 1] * c);
    combined[i * 4 + 2] = Math.round(base[i * 4 + 2] * c);
    combined[i * 4 + 3] = alpha;
  }

  const image = await sharp(combined, {
    raw: { width: baseRaw.width, height: baseRaw.height, channels: 4 },
  })
    .webp()
    .toBuffer();

  return { hasAlpha, image };
}
