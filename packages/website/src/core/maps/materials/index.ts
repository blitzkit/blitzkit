import {
  Mesh,
  ShaderMaterial,
  type MeshStandardMaterial,
  type Object3D,
} from "three";
import type { MapMaterialExtras, MapWind } from "../extras";
import { createBorderMaterial } from "./border";
import { createGrassMaterial } from "./grass";
import { createObjectMaterial } from "./object";
import { createShadowDepthMaterial } from "./shadow";
import { createSkyMaterial } from "./sky";
import { createTerrainMaterial } from "./terrain";
import { createWaterMaterial } from "./water";

export { mapTime, SHADOW_COLOR, SUN_DIRECTION } from "./common";

export const VEGETATION_COLLISION_TYPE = 8;

export function isBatchable(object: Mesh) {
  return !!(object.material as ShaderMaterial).userData?.batchable;
}

export function hasAncestorValue(
  object: Object3D,
  key: string,
  value: unknown,
) {
  let current: Object3D | null = object;

  while (current) {
    if (current.userData[key] === value) return true;
    current = current.parent;
  }

  return false;
}

function hasAncestorFlag(object: Object3D, flag: string) {
  let current: Object3D | null = object;

  while (current) {
    if (current.userData[flag]) return true;
    current = current.parent;
  }

  return false;
}

function findWind(object: Object3D) {
  let current: Object3D | null = object;

  while (current) {
    if (current.userData.wind) return current.userData.wind as MapWind;
    current = current.parent;
  }
}

function createMaterial(
  object: Mesh,
  source: MeshStandardMaterial,
  extras: MapMaterialExtras,
  billboard: boolean,
  vertexColors: boolean,
  wind: MapWind | undefined,
) {
  switch (extras.kind) {
    case "terrain":
      return createTerrainMaterial(source, extras);

    case "sky":
      return createSkyMaterial(source, extras);

    case "grass":
      return createGrassMaterial(source, extras);

    case "water":
      return createWaterMaterial(
        source,
        extras,
        object.geometry.hasAttribute("_tangent"),
      );

    case "border":
      return createBorderMaterial();

    default:
      return createObjectMaterial(
        source,
        extras,
        billboard,
        vertexColors,
        wind,
      );
  }
}

export function convertMaterials(scene: Object3D) {
  const converted = new Map<string, ShaderMaterial>();
  const depthMaterials = new Map<string, ShaderMaterial>();

  scene.updateMatrixWorld(true);

  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;

    if (object.material instanceof ShaderMaterial) return;

    const source = object.material as MeshStandardMaterial;
    const extras = source.userData as MapMaterialExtras;

    if (extras.kind === "particleSprite") return;

    if (extras.kind === "collision") {
      object.visible = false;
      return;
    }

    const billboard = object.geometry.hasAttribute("_pivot");
    const vertexColors = object.geometry.hasAttribute("color");
    const wind =
      extras.kind === "speedTree" &&
      object.geometry.hasAttribute("_flexibility") &&
      object.geometry.hasAttribute("_angle_sin_cos")
        ? findWind(object)
        : undefined;
    const key = `${
      source.uuid
    }:${billboard}:${vertexColors}:${object.geometry.hasAttribute(
      "_tangent",
    )}:${JSON.stringify(wind)}`;

    if (!converted.has(key)) {
      converted.set(
        key,
        createMaterial(object, source, extras, billboard, vertexColors, wind),
      );
    }

    object.material = converted.get(key)!;
    object.receiveShadow = !!extras.shadowReceiver;
    object.castShadow = hasAncestorFlag(object, "castShadow");

    if (extras.kind === "grass" || extras.kind === "water") {
      object.userData.reflect = false;
    }

    if (
      object.castShadow &&
      (extras.kind === "object" || extras.kind === "speedTree") &&
      (extras.alphaTest || extras.alphaBlend)
    ) {
      if (!depthMaterials.has(key)) {
        depthMaterials.set(
          key,
          createShadowDepthMaterial(object.material as ShaderMaterial, extras),
        );
      }

      object.customDepthMaterial = depthMaterials.get(key);
    }

    if (extras.kind === "sky") {
      object.renderOrder = -1;
      object.frustumCulled = false;
    }
  });
}
