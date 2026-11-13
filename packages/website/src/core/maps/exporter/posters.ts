import { join, normalize } from "path/posix";
import sharp from "sharp";
import type { RawTexture } from "./textures";

type PosterRect = [left: number, top: number, right: number, bottom: number];

interface PosterSlot {
  rect: PosterRect;
  image?: string;
  fit?: "cover" | "contain";
}

type PosterAtlas = Record<string, PosterSlot>;

const POSTER_DIRECTORY = "src/core/maps/posters";
const RECT_UNITS = 512;
const POSTER_ATLAS_SIZE = 2048;
const POSTER_QUALITY = 95;
const POSTER_BACKGROUND = "#000000";

const GIRL_POSTER: PosterRect = [6, 306, 259, 507];
const CAR_POSTER: PosterRect = [267, 308, 504, 503];

const POSTER_ATLASES: Record<string, PosterAtlas> = {
  "Maps/34_forgecity_fc/environmet/images/env_fc_bigboard.tex": {
    girl: { rect: GIRL_POSTER, image: "work-of-many.png" },
    car: { rect: CAR_POSTER, image: "work-of-many-car.png" },
  },
  "Maps/00_global_content/environmet/images/env_pt_bigboard.tex": {
    girl: { rect: GIRL_POSTER, image: "night-watch-1957.png", fit: "contain" },
    car: { rect: CAR_POSTER, image: "incognito-donnola.jpg", fit: "contain" },
  },
  "Maps/00_shared_content/environment/env_poster/images/Bilbords_albedo.tex": {
    hotel: { rect: [3, 141, 54, 509] },
    mountains: { rect: [348, 61, 479, 93] },
    shoe: { rect: [299, 48, 339, 159] },
    cafe: { rect: [223, 360, 257, 465] },
    coffee: { rect: [77, 32, 128, 189] },
    coffeeBoard: { rect: [422, 114, 492, 246] },
    burger: { rect: [70, 242, 192, 320] },
    burgerArrow: { rect: [3, 32, 26, 125] },
    pharmacy: { rect: [329, 323, 449, 398] },
    green: { rect: [456, 274, 509, 491] },
    ship: { rect: [70, 378, 214, 452] },
    menu: { rect: [199, 194, 258, 273] },
  },
};

export function posterAtlas(directory: string, path: string) {
  return POSTER_ATLASES[normalize(`${directory}/${path}`)];
}

export async function replacePosters(raw: RawTexture, atlas: PosterAtlas) {
  const image = sharp(raw.data, { raw });
  const slots = Object.values(atlas).filter((slot) => slot.image);

  if (slots.length === 0) return image.webp().toBuffer();

  const width = POSTER_ATLAS_SIZE;
  const height = Math.round((raw.height / raw.width) * POSTER_ATLAS_SIZE);
  const scaleX = width / RECT_UNITS;
  const scaleY = height / RECT_UNITS;
  const overlays = await Promise.all(
    slots.map(async ({ rect: [left, top, right, bottom], image, fit }) => ({
      input: await sharp(join(POSTER_DIRECTORY, image!))
        .resize(
          Math.round((right - left) * scaleX),
          Math.round((bottom - top) * scaleY),
          { fit: fit ?? "cover", background: POSTER_BACKGROUND },
        )
        .toBuffer(),
      left: Math.round(left * scaleX),
      top: Math.round(top * scaleY),
    })),
  );

  return image
    .resize(width, height)
    .composite(overlays)
    .webp({ quality: POSTER_QUALITY })
    .toBuffer();
}
