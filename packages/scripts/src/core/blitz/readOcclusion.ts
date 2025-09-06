import { writeFile } from "fs/promises";
import sharp from "sharp";
import { readTexture } from "./readTexture";

export async function readOcclusion(path: string) {
  const raw = await readTexture(path);
  const blitz = sharp(raw.data, { raw: raw });
  const occlusion = await blitz?.extractChannel(3).raw().toBuffer();

  const combined = Buffer.alloc(raw.width * raw.height * 3);

  for (let i = 0; i < raw.width * raw.height; i++) {
    combined[i * 3 + 0] = occlusion?.[i] ?? 0;
  }

  const image = await sharp(combined, {
    raw: { width: raw.width, height: raw.height, channels: 3 },
  })
    .jpeg()
    .toBuffer();

  writeFile("test.ao.jpg", image);

  return image;
}
