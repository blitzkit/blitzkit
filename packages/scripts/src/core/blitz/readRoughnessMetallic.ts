import { writeFile } from "fs/promises";
import sharp from "sharp";
import { readTexture } from "./readTexture";

export async function readRoughnessMetallic(path: string) {
  const raw = await readTexture(path);
  const blitz = sharp(raw.data, { raw: raw });
  const metallicness = await blitz?.extractChannel(1).raw().toBuffer();
  const roughness = await blitz?.extractChannel(3).raw().toBuffer();

  const combined = Buffer.alloc(raw.width * raw.height * 3);

  for (let i = 0; i < raw.width * raw.height; i++) {
    combined[i * 3 + 1] = roughness?.[i] ?? 0;
    combined[i * 3 + 2] = metallicness?.[i] ?? 0;
  }

  const image = await sharp(combined, {
    raw: { width: raw.width, height: raw.height, channels: 3 },
  })
    .jpeg()
    .toBuffer();

  writeFile("test.rm.jpg", image);

  return image;
}
