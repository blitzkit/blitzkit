import sharp from "sharp";
import { readTexture } from "./readTexture";

export async function readNormal(path: string, isBase: boolean) {
  const raw = await readTexture(path);

  if (!isBase) {
    return await sharp(raw.data, { raw }).removeAlpha().jpeg().toBuffer();
  }

  const bytes = 4 * raw.width * raw.height;

  for (let index = 0; index < bytes; index += 4) {
    /**
     * Red is always 255 and blue is always 0. Only alpha and green contain any
     * sort of information.
     */
    let x = raw.data[index + 3] * (2 / 255) - 1;
    let y = raw.data[index + 1] * (2 / 255) - 1;
    let z = Math.sqrt(Math.max(0, 1 - x ** 2 - y ** 2));

    raw.data[index] = Math.round((x + 1) * (255 / 2));
    raw.data[index + 1] = Math.round((y + 1) * (255 / 2));
    raw.data[index + 2] = Math.round((z + 1) * (255 / 2));
    raw.data[index + 3] = 255;
  }

  return await sharp(raw.data, { raw }).jpeg().toBuffer();
}
