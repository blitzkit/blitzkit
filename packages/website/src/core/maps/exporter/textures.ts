import type { Document, Material, Texture } from "@gltf-transform/core";
import { KHRMaterialsClearcoat } from "@gltf-transform/extensions";
import sharp from "sharp";
import {
  readBaseColor,
  readTexture,
} from "../../../pages/[...chunk_api]/tanks/[id]/model.glb";
import { TEXTURE_SLOTS, type TextureRole } from "../extras";
import type { MapContext } from "./context";

export type RawTexture = Awaited<ReturnType<typeof readTexture>>;

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

  function load(path: string, rgbOnly: boolean) {
    const key = `${path}:${rgbOnly}`;

    if (!pending.has(key)) {
      pending.set(
        key,
        (rgbOnly
          ? readMapTexture(context, path).then((raw) =>
              sharp(raw.data, { raw }).removeAlpha().webp().toBuffer(),
            )
          : readBaseColor(`Data/3d/${context.directory}/${path}`)
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

  function get(path: string | undefined, rgbOnly: boolean) {
    return path === undefined ? undefined : loaded.get(`${path}:${rgbOnly}`);
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
