import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import { dirname } from "path/posix";
import sharp, { type Sharp } from "sharp";

async function premultiply(image: Sharp) {
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] / 255;

    data[index] = Math.round(data[index] * alpha);
    data[index + 1] = Math.round(data[index + 1] * alpha);
    data[index + 2] = Math.round(data[index + 2] * alpha);
  }

  return await sharp(data, { raw: info })
    .removeAlpha()
    .webp({ lossless: true })
    .toBuffer();
}

// the first frame of an atlas, or a texture of its own
export async function readSprite(vfs: AbstractVFS, spritePath: string) {
  const path = spritePath.replace("~res:/", "Data/");

  if (!(await vfs.resolve(`${path}.txt`))) {
    return await premultiply(sharp(await vfs.file(`${path}.packed.webp`)));
  }

  const lines = (await vfs.text(`${path}.txt`)).split(/\r?\n/);
  const textureCount = Number(lines[0]);
  const [left, top, width, height, , , texture] = lines[textureCount + 3]
    .split(" ")
    .map(Number);
  const image = await vfs.file(`${dirname(path)}/${lines[texture + 1].trim()}`);

  return await premultiply(sharp(image).extract({ left, top, width, height }));
}
