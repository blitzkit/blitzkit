import type { Document, Material, Texture } from "@gltf-transform/core";
import { KHRMaterialsClearcoat } from "@gltf-transform/extensions";
import sharp from "sharp";
import {
  readBaseColor,
  readTexture,
} from "../../../pages/[...chunk_api]/tanks/[id]/model.glb";
import { TEXTURE_SLOTS, type TextureRole } from "../extras";
import type { MapContext } from "./context";
import { posterAtlas, replacePosters } from "./posters";

export type RawTexture = Awaited<ReturnType<typeof readTexture>>;

export type TextureFormat = "rgba" | "rgb" | "rgbTimesAlpha";

function rgbTimesAlpha(image: RawTexture) {
  if (image.channels !== 4) return sharp(image.data, { raw: image });

  const { width, height } = image;
  const pixels = Buffer.alloc(width * height * 3);

  for (let index = 0; index < width * height; index++) {
    const alpha = image.data[index * 4 + 3] / 255;

    for (let channel = 0; channel < 3; channel++) {
      pixels[index * 3 + channel] = image.data[index * 4 + channel] * alpha;
    }
  }

  return sharp(pixels, { raw: { width, height, channels: 3 } });
}

export function readMapTexture({ directory }: MapContext, path: string) {
  return readTexture(`Data/3d/${directory}/${path}`);
}

export async function losslessTexture(
  { document }: MapContext,
  name: string,
  image: sharp.Sharp,
) {
  const bytes = await image.webp({ lossless: true }).toBuffer();

  return document.createTexture(name).setMimeType("image/webp").setImage(bytes);
}

export function createTextureLoader(context: MapContext) {
  const loaded = new Map<string, Texture | null>();
  const pending = new Map<string, Promise<Texture | null>>();

  function readAlbedo(path: string) {
    const posters = posterAtlas(context.directory, path);

    return posters
      ? readMapTexture(context, path).then((raw) =>
          replacePosters(raw, posters),
        )
      : readBaseColor(`Data/3d/${context.directory}/${path}`);
  }

  function load(path: string, format: TextureFormat) {
    const key = `${path}:${format}`;

    if (!pending.has(key)) {
      pending.set(
        key,
        (format === "rgba"
          ? readAlbedo(path)
          : readMapTexture(context, path).then((raw) =>
              (format === "rgb"
                ? sharp(raw.data, { raw }).removeAlpha()
                : rgbTimesAlpha(raw)
              )
                .webp()
                .toBuffer(),
            )
        )
          .then((image) =>
            context.document
              .createTexture(path)
              .setMimeType("image/webp")
              .setImage(image),
          )
          .catch(() => null)
          .then((texture) => {
            loaded.set(key, texture);

            return texture;
          }),
      );
    }

    return pending.get(key)!;
  }

  function get(path: string | undefined, format: TextureFormat) {
    return path === undefined ? undefined : loaded.get(`${path}:${format}`);
  }

  return { load, get };
}

export type TextureLoader = ReturnType<typeof createTextureLoader>;

export function setTextureSlot(
  document: Document,
  material: Material,
  role: TextureRole,
  texture: Texture,
) {
  switch (TEXTURE_SLOTS[role]) {
    case "baseColor":
      return material.setBaseColorTexture(texture);

    case "occlusion":
      return material.setOcclusionTexture(texture);

    case "emissive":
      return material.setEmissiveTexture(texture);

    case "normal":
      return material.setNormalTexture(texture);

    case "metallicRoughness":
      return material.setMetallicRoughnessTexture(texture);

    case "clearcoat":
      return material.setExtension(
        "KHR_materials_clearcoat",
        document
          .createExtension(KHRMaterialsClearcoat)
          .createClearcoat()
          .setClearcoatFactor(1)
          .setClearcoatTexture(texture),
      );
  }
}
