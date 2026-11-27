import {
  bufferToBigInt,
  type Component,
  type ParticleEmitterNode,
  type ParticleForce,
  type ParticleLayer,
  type ParticleValue,
  type SC2,
} from "@blitzkit/core";
import { times } from "lodash-es";
import {
  ParticleBlending,
  ParticleForceType,
  ParticleShape,
  type ParticleEmitterExtras,
  type ParticleForceExtras,
  type ParticleKeys,
  type ParticleLayerExtras,
} from "./types";

export type ParticleEffect = Extract<
  Component,
  { "comp.typename": "ParticleEffectComponent" }
>;

const CURVE = 2;
// keys interpolate linearly (1) or cubically (2), or not at all
const HELD_KEY = 0;
const FORCES: Partial<Record<ParticleForce["forceType"], ParticleForceType>> =
  {
    drag: ParticleForceType.Drag,
    grav: ParticleForceType.Gravity,
    wind: ParticleForceType.Wind,
  };
const BLENDING_ADDITIVE = 2;
const BLENDING_ALPHA_ADDITIVE = 3;
const CAMERA_FACING = 1 << 0;
// each facing bit draws its own quad across these two axes of the emitter
const FACINGS = [
  { bit: 1 << 1, axes: [[0, 1, 0], [0, 0, 1]] },
  { bit: 1 << 2, axes: [[1, 0, 0], [0, 0, 1]] },
  { bit: 1 << 3, axes: [[0, 1, 0], [1, 0, 0]] },
];

// values bound to something like the vehicle's speed are read at their factor
function settle(value: ParticleValue | undefined): ParticleValue | undefined {
  return Array.isArray(value) && typeof value[1] === "string"
    ? ((value[3] as ParticleValue | undefined) ??
        settle(value[2] as ParticleValue))
    : value;
}

function isCurve(
  value: ParticleValue | undefined,
): value is Extract<ParticleValue, unknown[]> {
  return (
    Array.isArray(value) && value[0] === CURVE && Array.isArray(value[1])
  );
}

// some curves carry loose numbers after their channels
function channels(curve: Extract<ParticleValue, unknown[]>): ParticleKeys[] {
  return (curve.slice(1).filter(Array.isArray) as number[][][]).map((keys) =>
    keys.map(([type, value, time]) => [
      time,
      value,
      type === HELD_KEY ? 1 : 0,
    ]),
  );
}

function scalar(value: ParticleValue | undefined, fallback: number) {
  const settled = settle(value);

  if (typeof settled === "number") return settled;
  if (isCurve(settled)) return channels(settled)[0][0][1];

  return fallback;
}

function vector(value: ParticleValue | undefined, fallback: number[]) {
  const settled = settle(value);

  if (isCurve(settled)) return channels(settled).map((keys) => keys[0][1]);
  if (Array.isArray(settled)) return settled as number[];

  return fallback;
}

// a lone number turns about z
function angles(value: ParticleValue | undefined) {
  const settled = settle(value);

  if (typeof settled === "number") return [0, 0, settled];

  return times(3, (index) => vector(settled, [0, 0, 0])[index] ?? 0);
}

function keys(value: ParticleValue | undefined): ParticleKeys[] | undefined {
  const settled = settle(value);

  if (typeof settled === "number") return [[[0, settled]]];
  if (isCurve(settled)) return channels(settled);
  if (Array.isArray(settled)) {
    return (settled as number[]).map((channel) => [[0, channel]]);
  }
}

function unpack(color: number) {
  return times(4, (index) => ((color >>> ((3 - index) * 8)) & 0xff) / 255);
}

function colorKeys(value: ParticleValue | undefined) {
  const settled = settle(value);

  if (typeof settled === "number") {
    return unpack(settled).map((channel) => [[0, channel]]);
  }

  if (isCurve(settled)) return channels(settled);
}

// the area under a curve that runs from 0 to 1, holding its last value
function average(keys: ParticleKeys) {
  let area = keys[0][1] * keys[0][0];

  for (let index = 1; index < keys.length; index++) {
    const [time, value] = keys[index];
    const [previousTime, previousValue] = keys[index - 1];

    area += ((value + previousValue) / 2) * (time - previousTime);
  }

  const [time, value] = keys.at(-1)!;

  return area + value * Math.max(0, 1 - time);
}

// point gravity and vortices are rare, so they're left out
function readForces(layer: ParticleLayer) {
  return layer.forces
    .filter(({ forceIsActive }) => forceIsActive)
    .flatMap((force): ParticleForceExtras[] => {
      const type = FORCES[force.forceType];

      if (type === undefined) return [];

      return [
        {
          type,
          strength: vector(force.dragForceLine, [0, 0, 0]),
          direction: vector(force.forceDirection, [0, 0, 1]),
        },
      ];
    });
}

function blending(layer: ParticleLayer): ParticleBlending {
  if (layer.blending === BLENDING_ADDITIVE) return ParticleBlending.Additive;
  if (layer.blending === BLENDING_ALPHA_ADDITIVE) {
    return ParticleBlending.AlphaAdditive;
  }

  return ParticleBlending.Normal;
}

function readLayer(layer: ParticleLayer): ParticleLayerExtras | undefined {
  if (layer.layerType !== "particles" || !layer.spritePath) return;

  const facings = FACINGS.filter(
    ({ bit }) => layer.particleOrientation & bit,
  ).map(({ axes }) => axes);
  const billboard =
    (layer.particleOrientation & CAMERA_FACING) !== 0 || facings.length === 0;

  return {
    sprite: layer.spritePath,
    blending: blending(layer),
    billboard,
    facings,
    single: layer.isSingle,
    inherit: layer.inheritPosition,
    forces: readForces(layer),
    fresnel: layer.useFresToAlpha
      ? {
          bias: layer.fresToAlphaBias ?? 0,
          power: layer.fresToAlphaPower ?? 1,
        }
      : undefined,
    number: scalar(layer.number, 0),
    numberVariation: scalar(layer.numberVariation, 0),
    life: scalar(layer.life, 0),
    lifeVariation: scalar(layer.lifeVariation, 0),
    velocity: scalar(layer.velocity, 0),
    velocityVariation: scalar(layer.velocityVariation, 0),
    size: vector(layer.size3d, [1, 1, 1]).slice(0, 2),
    sizeVariation: vector(layer.sizeVariation3d, [0, 0, 0]).slice(0, 2),
    sizeOverLife: keys(layer.sizeOverLife3ds),
    alphaOverLife: keys(layer.alphaOverLife)?.[0],
    colorOverLife: colorKeys(layer.colorOverLife),
    // a random pick from this gradient, so its average stands in for it
    color: colorKeys(layer.colorRandom)?.map(average) ?? [1, 1, 1, 1],
    angle: angles(layer.angle3d),
    angleVariation: angles(layer.angleVariation3d),
    spin: angles(layer.spin3d),
    spinVariation: angles(layer.spinVariation3d),
    pivot: layer.pivotPoint3d.slice(0, 2),
    lods: layer.activeLODS,
  };
}

/** emitters by id, with clones resolved to the emitter they copy */
export function particleEmitters(sc2: SC2) {
  const nodes = new Map(
    (sc2["#dataNodes"] as unknown as ParticleEmitterNode[])
      .filter((node) => node["##name"] === "ParticleEmitterNode")
      .map((node) => [bufferToBigInt(node["#id"]), node]),
  );

  return function emitter(id: bigint): ParticleEmitterNode | undefined {
    const node = nodes.get(id);

    return node?.clone ? emitter(BigInt(node["reference.id"]!)) : node;
  };
}

/**
 * reads an effect's emitters in the effect's space; `highest` prefers the
 * highest quality over the default, either falling back to the other when it
 * has no layers
 */
export function readParticleEffect(
  effect: ParticleEffect,
  emitters: ReturnType<typeof particleEmitters>,
  highest: boolean,
) {
  const read: ParticleEmitterExtras[] = [];

  for (const emitter of effect["pe.emitters"]) {
    const variants = emitter["emitter.data"].map((data) => {
      const node = emitters(BigInt(data["emitter.id"]));

      if (!node) throw new Error(`Missing emitter ${data["emitter.id"]}`);

      return { quality: data["emitter.quality"], node };
    });
    const drawn = variants.filter(({ node }) => node.layers?.length);
    const preferred = highest
      ? drawn.find(({ quality }) => quality.includes("HIGHEST"))
      : drawn.find(({ quality }) => quality === "Default");
    const node = (preferred ?? drawn[0])?.node;
    const layers = (node?.layers ?? [])
      .map(readLayer)
      .filter((layer) => layer !== undefined);

    if (!node || layers.length === 0) continue;

    read.push({
      position: emitter["emitter.position"],
      rotation: emitter["emitter.rotation"],
      scale: emitter["emitter.scale"],
      direction: vector(node.emissionVector, [0, 0, 1]),
      range: scalar(node.emissionRange, 0),
      shape:
        node.type !== undefined && node.type in ParticleShape
          ? node.type
          : ParticleShape.Point,
      radius: scalar(node.radius, 0),
      size: vector(node.size, [0, 0, 0]),
      layers,
    });
  }

  return read;
}
