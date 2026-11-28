import sharp from "sharp";
import { vfs } from "../blitzkit/vfs";
import { extractPackedIcon } from "./extractPackedIcon";
import { parsePackedSpriteRect } from "./parsePackedSpriteRect";

// Route props that point at a sprite, for each way of reading one
export interface PackedSpriteProps {
  packed: string;
}

export interface DiscreteSpriteProps {
  descriptor: string;
  texture: string;
}

// A standalone texture; the sprite rect lives in its RIFF `extr` chunk. Reads
// it the way the client does, as webp. Trimming is only a guess, so it is
// used solely for textures that carry no rect.
export async function readPackedSprite(path: string) {
  const packed = await vfs.file(path);
  const texture = sharp(packed);
  const rect = parsePackedSpriteRect(packed);

  if (rect === null) {
    return new Uint8Array(await texture.trim().webp().toBuffer());
  }

  return new Uint8Array(await extractPackedIcon(texture, rect));
}

// A rect in a `.txt` descriptor (line 4) cut out of a shared atlas texture
export async function readDiscreteSprite(descriptor: string, texture: string) {
  const rect = (await vfs.text(descriptor))
    .split("\n")[4]
    .split(" ")
    .map(Number);

  return new Uint8Array(
    await extractPackedIcon(sharp(await vfs.file(texture)), rect)
  );
}

// Sprites in the UI styles are named without an extension and are either a
// standalone texture or an entry of the `texture0` atlas next to them
export async function readStyleSprite(path: string) {
  const packed = `${path}.packed.webp`;

  if (await vfs.resolve(packed)) return await readPackedSprite(packed);

  return await readDiscreteSprite(
    `${path}.txt`,
    `${path.split("/").slice(0, -1).join("/")}/texture0.packed.webp`
  );
}
