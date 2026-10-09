import { bufferToBigInt } from "@blitzkit/core";
import type { Material } from "@gltf-transform/core";
import sharp from "sharp";
import { vfs } from "../../blitzkit/vfs";
import type {
  MapMaterialExtras,
  MapParticleEffect,
  MapParticleEmitter,
  MapParticleLayer,
} from "../extras";
import { createAccessor, type DataNode, type MapContext } from "./context";
import {
  findComponent,
  hierarchyComponents,
  indexedEntries,
  type MapComponent,
} from "./hierarchy";
import { PARTICLE_START_ACTION, SCENE_LOADED_EVENT } from "./script";

const SPRITE_FRAME_LINE = 4;
const SPRITE_TEXTURE_LINE = 1;

function readKeyframes(keyframes: any) {
  return Array.isArray(keyframes?.[1])
    ? (keyframes[1] as number[][]).map(([, value, time]) => [time, value])
    : undefined;
}

async function loadSprite({ document }: MapContext, spritePath: string) {
  const base = spritePath.replace(/^~res:\//, "Data/");
  const atlas = (await vfs.text(`${base}.txt`)).split(/\r?\n/);
  const textureName = atlas[SPRITE_TEXTURE_LINE].trim();
  const [x, y, width, height] = atlas[SPRITE_FRAME_LINE].trim()
    .split(/\s+/)
    .map(Number);
  const atlasImage = await vfs.file(
    `${base.slice(0, base.lastIndexOf("/"))}/${textureName}`,
  );
  const image = await sharp(atlasImage)
    .extract({ left: x, top: y, width, height })
    .ensureAlpha()
    .webp({ lossless: true })
    .toBuffer();

  return document
    .createTexture(spritePath)
    .setMimeType("image/webp")
    .setImage(image);
}

function startsOnLoad(action: MapComponent | undefined) {
  return (
    !!action &&
    indexedEntries(action, action["ac.actionCount"]).some(
      (entry) =>
        entry["act.event"] === SCENE_LOADED_EVENT &&
        entry["act.type"] === PARTICLE_START_ACTION,
    )
  );
}

function indexDataNodes(dataNodes: DataNode[]) {
  const byId = new Map<bigint, DataNode>();

  for (const node of dataNodes) {
    if (!node["#id"]) continue;

    const id = bufferToBigInt(node["#id"]);

    if (!byId.has(id)) byId.set(id, node);
  }

  return byId;
}

export async function createParticles(context: MapContext) {
  const { document } = context;
  const particlesNode = document.createNode("particles");
  const sprites = new Map<string, Material>();
  const effects: MapParticleEffect[] = [];
  const dataNodes = indexDataNodes(context.dataNodes);

  for (const hierarchy of context.sc2["#hierarchy"]) {
    const components = hierarchyComponents(hierarchy);
    const effect = findComponent(components, "ParticleEffectComponent");
    const transform = findComponent(components, "TransformComponent");

    if (
      !effect ||
      !startsOnLoad(findComponent(components, "ActionComponent")) ||
      !transform
    ) {
      continue;
    }

    const emitters: MapParticleEmitter[] = [];

    for (const emitter of effect["pe.emitters"]) {
      const data = emitter["emitter.data"].find(
        (entry: MapComponent) => entry["emitter.quality"] === "Default",
      );
      const emitterNode = data
        ? dataNodes.get(BigInt(data["emitter.id"]))
        : undefined;

      if (!emitterNode) continue;

      const layers: MapParticleLayer[] = [];

      for (const layer of emitterNode.layers ?? []) {
        if (layer.layerType !== "particles" || !layer.spritePath) continue;

        if (!sprites.has(layer.spritePath)) {
          const texture = await loadSprite(context, layer.spritePath).catch(
            () => null,
          );

          if (!texture) continue;

          sprites.set(
            layer.spritePath,
            document
              .createMaterial(layer.spritePath)
              .setBaseColorTexture(texture)
              .setExtras({
                kind: "particleSprite",
                sprite: layer.spritePath,
              } satisfies MapMaterialExtras),
          );
        }

        const color = layer.colorOverLife as number;

        layers.push({
          sprite: layer.spritePath,
          number: layer.number,
          numberVariation: layer.numberVariation,
          life: layer.life,
          lifeVariation: layer.lifeVariation,
          velocity: layer.velocity,
          velocityVariation: layer.velocityVariation,
          size: layer.size3d,
          sizeVariation: layer.sizeVariation3d,
          sizeOverLife: readKeyframes(layer.sizeOverLife3ds),
          alphaOverLife: readKeyframes(layer.alphaOverLife),
          angle: layer.angle3d?.[2] ?? 0,
          angleVariation: layer.angleVariation3d?.[2] ?? 0,
          color: [24, 16, 8, 0].map(
            (shift) => ((color >>> shift) & 0xff) / 255,
          ),
        });
      }

      emitters.push({
        offset: emitter["emitter.position"],
        direction: emitterNode.emissionVector,
        range: emitterNode.emissionRange,
        radius: emitterNode.radius ?? 0,
        layers,
      });
    }

    effects.push({ position: transform["tc.worldTranslation"], emitters });
  }

  if (effects.length === 0) return;

  for (const material of sprites.values()) {
    particlesNode.addChild(
      document.createNode(material.getName()).setMesh(
        document.createMesh().addPrimitive(
          document
            .createPrimitive()
            .setMaterial(material)
            .setAttribute(
              "POSITION",
              createAccessor(context, "VEC3", new Float32Array(9)),
            ),
        ),
      ),
    );
  }

  return particlesNode.setExtras({ effects });
}
