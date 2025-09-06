import sharp from "sharp";
import { readTexture } from "./readTexture";

export async function readBaseColor(path: string) {
  const raw = await readTexture(path);
  return await sharp(raw.data, { raw }).removeAlpha().jpeg().toBuffer();
}
