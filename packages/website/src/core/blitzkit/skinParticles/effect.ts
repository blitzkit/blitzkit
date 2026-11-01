import {
  bufferToBigInt,
  type Component,
  type ParticleEmitterNode,
  type ParticleLayer,
  type Sc2ReadStream,
} from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import type {
  Buffer,
  Document,
  Node,
  Texture,
  vec4,
} from "@gltf-transform/core";
import { KHRMaterialsSpecular } from "@gltf-transform/extensions";
import { MathUtils, Vector3 } from "three";
import { createAccessor } from "../skinAnimations/skeleton";
import {
  ALWAYS,
  FACINGS,
  isStill,
  quadColor,
  quadSize,
  startAngle,
} from "./layer";
import { readSprite } from "./sprite";

type ParticleEffect = Extract<
  Component,
  { "comp.typename": "ParticleEffectComponent" }
>;

function createQuad(
  document: Document,
  buffer: Buffer,
  layer: ParticleLayer,
  { ex, ey }: (typeof FACINGS)[number],
) {
  const [width, height] = quadSize(layer);
  const [pivotX, pivotY] = layer.pivotPoint3d;
  // artists consider positive rotation to be clockwise
  const angle = MathUtils.degToRad(-startAngle(layer)[2]);
  const x = new Vector3(...ex);
  const y = new Vector3(...ey);
  const left = x
    .clone()
    .multiplyScalar(Math.cos(angle))
    .addScaledVector(y, Math.sin(angle));
  const top = y
    .clone()
    .multiplyScalar(-Math.cos(angle))
    .addScaledVector(x, Math.sin(angle));
  const right = left.clone().multiplyScalar(-(width / 2) * (1 - pivotX));
  const bottom = top.clone().multiplyScalar(-(height / 2) * (1 - pivotY));

  left.multiplyScalar((width / 2) * (1 + pivotX));
  top.multiplyScalar((height / 2) * (1 + pivotY));

  const corners = [
    left.clone().add(bottom),
    right.clone().add(bottom),
    left.clone().add(top),
    right.clone().add(top),
  ];
  const normal = x.clone().cross(y);

  return document
    .createPrimitive()
    .setIndices(
      createAccessor(
        document,
        buffer,
        "SCALAR",
        new Uint16Array([0, 1, 2, 2, 1, 3]),
      ),
    )
    .setAttribute(
      "POSITION",
      createAccessor(
        document,
        buffer,
        "VEC3",
        new Float32Array(corners.flatMap((corner) => corner.toArray())),
      ),
    )
    .setAttribute(
      "NORMAL",
      createAccessor(
        document,
        buffer,
        "VEC3",
        new Float32Array(corners.flatMap(() => normal.toArray())),
      ),
    )
    .setAttribute(
      "TEXCOORD_0",
      createAccessor(
        document,
        buffer,
        "VEC2",
        new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      ),
    );
}

// an action's repeats win over the effect's, and 0 repeats forever
function isLasting(effect: ParticleEffect, repeats: number) {
  const runs = repeats > 0 ? repeats : effect["pe.repeatsCount"];

  return runs === 0 || runs * effect["pe.effectDuration"] >= ALWAYS;
}

// quality variants without layers of their own draw the default
function emitterVariant(
  emitter: ParticleEffect["pe.emitters"][number],
  emitters: Map<bigint, ParticleEmitterNode>,
) {
  const variants = emitter["emitter.data"].map((data) => {
    const variant = emitters.get(BigInt(data["emitter.id"]));

    if (!variant) throw new Error(`Missing emitter ${data["emitter.id"]}`);

    return { quality: data["emitter.quality"], variant };
  });
  const high = variants.find(
    ({ quality, variant }) => quality.includes("HIGHEST") && variant.layers,
  );

  return (high ?? variants.find(({ quality }) => quality === "Default"))
    ?.variant;
}

export function particleEmitters(sc2: ReturnType<Sc2ReadStream["sc2"]>) {
  const nodes = sc2["#dataNodes"] as unknown as ParticleEmitterNode[];

  return new Map(
    nodes
      .filter((node) => node["##name"] === "ParticleEmitterNode")
      .map((node) => [bufferToBigInt(node["#id"]), node]),
  );
}

/**
 * Draws the layers of a particle effect that hold still as quads, the same way
 * the game positions them. They are unlit and additive, emissive so the viewer
 * can fade them with the lights.
 */
export async function createParticleEffect(
  document: Document,
  buffer: Buffer,
  vfs: AbstractVFS,
  node: Node,
  effect: ParticleEffect,
  repeats: number,
  emitters: Map<bigint, ParticleEmitterNode>,
) {
  if (!isLasting(effect, repeats)) return;

  const textures = new Map<string, Texture>();
  const specular = document.createExtension(KHRMaterialsSpecular);

  for (const emitter of effect["pe.emitters"]) {
    const variant = emitterVariant(emitter, emitters);

    if (!variant?.layers) continue;

    const emitterNode = document
      .createNode(variant.name)
      .setTranslation(emitter["emitter.position"])
      .setRotation(emitter["emitter.rotation"])
      .setScale(emitter["emitter.scale"]);

    for (const layer of variant.layers) {
      if (!isStill(layer, variant)) continue;

      const { emissive, alpha } = quadColor(layer);

      if (alpha === 0) continue;

      const spritePath = layer.spritePath!;

      if (!textures.has(spritePath)) {
        textures.set(
          spritePath,
          document
            .createTexture(spritePath)
            .setMimeType("image/webp")
            .setImage(await readSprite(vfs, spritePath)),
        );
      }

      const material = document
        .createMaterial(layer.name)
        .setBaseColorFactor([0, 0, 0, alpha] as vec4)
        .setEmissiveTexture(textures.get(spritePath)!)
        .setEmissiveFactor(emissive)
        // anything else reflects the lights at grazing angles, even if black
        .setMetallicFactor(0)
        .setExtension(
          "KHR_materials_specular",
          specular.createSpecular().setSpecularFactor(0),
        )
        .setAlphaMode("BLEND")
        .setDoubleSided(true)
        .setExtras({ blending: "additive", particle: true });
      const mesh = document.createMesh(layer.name);

      for (const facing of FACINGS) {
        if (layer.particleOrientation & facing.bit) {
          mesh.addPrimitive(
            createQuad(document, buffer, layer, facing).setMaterial(material),
          );
        }
      }

      emitterNode.addChild(document.createNode(layer.name).setMesh(mesh));
    }

    node.addChild(emitterNode);
  }
}
