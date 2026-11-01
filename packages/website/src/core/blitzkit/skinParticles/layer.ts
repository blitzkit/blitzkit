import type { ParticleEmitterNode, ParticleLayer } from "@blitzkit/core";
import { Color, SRGBColorSpace } from "three";
import { average, averageColor, isBound, isCurve, isVarying } from "./values";

const POINT_EMITTER = 0;
const BLENDING_ADDITIVE = 2;
const BLENDING_ALPHA_ADDITIVE = 3;
const WORLD_ALIGN = 1 << 4;
const CAMERA_FACING_STRIPE = 1 << 5;
// seconds, past this something might as well last forever
export const ALWAYS = 1000;
// each facing bit draws its own quad across these two axes of the effect
export const FACINGS = [
  { bit: 1 << 1, ex: [0, 1, 0], ey: [0, 0, 1] },
  { bit: 1 << 2, ex: [1, 0, 0], ey: [0, 0, 1] },
  { bit: 1 << 3, ex: [0, 1, 0], ey: [1, 0, 0] },
] as const;

export function startAngle({ angle3d }: ParticleLayer) {
  if (angle3d === undefined) return [0, 0, 0];
  if (typeof angle3d === "number") return [0, 0, angle3d];
  if (!isCurve(angle3d)) return angle3d as number[];

  return (angle3d.slice(1) as number[][][]).map((keys) => keys[0][1]);
}

/**
 * a lone particle that respawns as it dies and holds its place is the same
 * thing as a quad, unlike anything that moves, animates or faces the camera;
 * tilted ones are left out too as the order of their rotations isn't known
 */
export function isStill(layer: ParticleLayer, emitter: ParticleEmitterNode) {
  const [tiltX, tiltY] = startAngle(layer);

  return (
    emitter.type === POINT_EMITTER &&
    tiltX === 0 &&
    tiltY === 0 &&
    !Object.values(layer).some(isBound) &&
    layer.layerType === "particles" &&
    layer.isSingle &&
    layer.inheritPosition &&
    !layer.isLong &&
    (layer.isLooped || layer.endTime >= ALWAYS) &&
    layer.deltaTime === 0 &&
    layer.deltaVariation === 0 &&
    layer.forces.length === 0 &&
    layer.simplifiedForces.length === 0 &&
    !layer.frameOverLifeEnabled &&
    !layer.enableAlphaRemap &&
    !layer.enableFlow &&
    !layer.enableMask &&
    !layer.enableNoise &&
    !layer.enableUvScroll &&
    !isVarying(layer.velocity) &&
    !isVarying(layer.spin3d) &&
    !isVarying(layer.angleVariation3d) &&
    (layer.blending === BLENDING_ADDITIVE ||
      layer.blending === BLENDING_ALPHA_ADDITIVE) &&
    (layer.particleOrientation & (WORLD_ALIGN | CAMERA_FACING_STRIPE)) === 0 &&
    FACINGS.some(({ bit }) => layer.particleOrientation & bit) &&
    layer.spritePath !== undefined
  );
}

export function quadSize(layer: ParticleLayer) {
  const [width, height] = layer.size3d ?? [1, 1, 1];
  const [varyWidth, varyHeight] = layer.sizeVariation3d ?? [0, 0, 0];
  const [scaleWidth, scaleHeight = scaleWidth] = layer.sizeOverLife3ds
    ? average(layer.sizeOverLife3ds)
    : [1];

  return [
    (width + varyWidth / 2) * scaleWidth,
    (height + varyHeight / 2) * scaleHeight,
  ];
}

export function quadColor(layer: ParticleLayer) {
  const [red, green, blue, alpha] = averageColor(layer.colorRandom).map(
    (channel, index) => channel * averageColor(layer.colorOverLife)[index],
  );
  const color = new Color().setRGB(red, green, blue, SRGBColorSpace);
  const fade = layer.alphaOverLife ? average(layer.alphaOverLife)[0] : 1;

  return {
    emissive: color.toArray() as [number, number, number],
    alpha: layer.blending === BLENDING_ALPHA_ADDITIVE ? alpha * fade : 1,
  };
}
