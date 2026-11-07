import {
  NoColorSpace,
  Vector3,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
  type Texture,
} from "three";
import { TEXTURE_SLOTS, type TextureRole, type TextureSlot } from "../extras";

export const mapTime = { value: 0 };
export const SHADOW_COLOR = new Vector3(0.7109, 0.8169, 1);
export const SUN_DIRECTION = new Vector3(0.5, 0.5, 0.707);

const SLOT_PROPERTIES = {
  baseColor: "map",
  occlusion: "aoMap",
  emissive: "emissiveMap",
  normal: "normalMap",
  metallicRoughness: "metalnessMap",
  clearcoat: "clearcoatMap",
} as const satisfies Record<TextureSlot, keyof MeshPhysicalMaterial>;

export function raw(texture: Texture | null) {
  if (!texture) return texture;

  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;

  return texture;
}

export function slotTexture(source: MeshStandardMaterial, role: TextureRole) {
  return raw(
    (source as MeshPhysicalMaterial)[SLOT_PROPERTIES[TEXTURE_SLOTS[role]]] ??
      null,
  );
}
