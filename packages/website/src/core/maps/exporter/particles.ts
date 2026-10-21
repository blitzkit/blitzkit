import { bufferToBigInt, type Hierarchy } from "@blitzkit/core";
import type { Material } from "@gltf-transform/core";
import { times } from "lodash-es";
import sharp from "sharp";
import { Matrix4, Quaternion, Vector3 } from "three";
import { vfs } from "../../blitzkit/vfs";
import type {
  MapMaterialExtras,
  MapParticleEffect,
  MapParticleEmitter,
  MapParticleLayer,
} from "../extras";
import { createAccessor, type DataNode, type MapContext } from "./context";
import { findComponent, hierarchyComponents } from "./hierarchy";

const SPRITE_FRAME_LINE = 4;
const SPRITE_TEXTURE_LINE = 1;
const CURVE_LINE = 2;

function constantLine(line: any): any {
  return Array.isArray(line) && typeof line[1] === "string"
    ? line[3] ?? constantLine(line[2])
    : line;
}

function isCurve(line: any): line is [number, ...number[][][]] {
  return (
    Array.isArray(line) && line[0] === CURVE_LINE && Array.isArray(line[1])
  );
}

function curveChannels(line: any) {
  return (line.slice(1) as number[][][]).map((keys) =>
    keys.map(([, value, time]) => [time, value]),
  );
}

function readScalar(line: any, fallback: number): number {
  const value = constantLine(line);

  if (typeof value === "number") return value;
  if (isCurve(value)) return value[1][0][1];

  return fallback;
}

function readVector(line: any, fallback: number[]): number[] {
  const value = constantLine(line);

  if (isCurve(value)) return curveChannels(value).map((keys) => keys[0][1]);
  if (Array.isArray(value)) return value;

  return fallback;
}

function readKeyframes(line: any) {
  return typeof line === "number"
    ? [[0, line]]
    : isCurve(line)
    ? curveChannels(line)[0]
    : Array.isArray(line)
    ? [[0, line[0]]]
    : undefined;
}

function readColorKeyframes(line: any) {
  return typeof line === "number"
    ? [24, 16, 8, 0].map((shift) => [[0, ((line >>> shift) & 0xff) / 255]])
    : isCurve(line)
    ? curveChannels(line)
    : undefined;
}

function readLayer(layer: DataNode): MapParticleLayer {
  const angle = readVector(layer.angle3d, [0, 0, 0]);
  const angleVariation = readVector(layer.angleVariation3d, [0, 0, 0]);

  return {
    sprite: layer.spritePath,
    number: readScalar(layer.number, 0),
    numberVariation: readScalar(layer.numberVariation, 0),
    life: readScalar(layer.life, 0),
    lifeVariation: readScalar(layer.lifeVariation, 0),
    velocity: readScalar(layer.velocity, 0),
    velocityVariation: readScalar(layer.velocityVariation, 0),
    size: readVector(layer.size3d, [0, 0, 0]),
    sizeVariation: readVector(layer.sizeVariation3d, [0, 0, 0]),
    sizeOverLife: readKeyframes(layer.sizeOverLife3ds),
    alphaOverLife: readKeyframes(layer.alphaOverLife),
    colorOverLife: readColorKeyframes(layer.colorOverLife),
    angle: angle[2],
    angleVariation: angleVariation[2],
    lods: layer.activeLODS ?? [true, true, true, true],
  };
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

function emitterMatrix(transform: DataNode, emitter: DataNode) {
  return new Matrix4()
    .compose(
      new Vector3(...transform["tc.worldTranslation"]),
      new Quaternion(...transform["tc.worldRotation"]),
      new Vector3(...transform["tc.worldScale"]),
    )
    .multiply(
      new Matrix4().compose(
        new Vector3(...emitter["emitter.position"]),
        new Quaternion(...emitter["emitter.rotation"]),
        new Vector3(...emitter["emitter.scale"]),
      ),
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

function findEmitterNode(
  dataNodes: Map<bigint, DataNode>,
  id: bigint,
): DataNode | undefined {
  const node = dataNodes.get(id);

  return node?.clone
    ? findEmitterNode(dataNodes, BigInt(node["reference.id"]))
    : node;
}

export async function createParticles(
  context: MapContext,
  particleStarts: Map<Hierarchy, number>,
) {
  const { document } = context;
  const particlesNode = document.createNode("particles");
  const sprites = new Map<string, Material>();
  const effects: MapParticleEffect[] = [];
  const dataNodes = indexDataNodes(context.dataNodes);

  for (const [hierarchy, delay] of particleStarts) {
    const components = hierarchyComponents(hierarchy);
    const effect = findComponent(components, "ParticleEffectComponent");
    const transform = findComponent(components, "TransformComponent");
    const lodComponent = findComponent(components, "LodComponent");

    if (!effect || !transform) continue;

    const emitters: MapParticleEmitter[] = [];

    for (const emitter of effect["pe.emitters"]) {
      const data = emitter["emitter.data"].find(
        (entry: DataNode) => entry["emitter.quality"] === "Default",
      );
      const emitterNode = data
        ? findEmitterNode(dataNodes, BigInt(data["emitter.id"]))
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

        layers.push(readLayer(layer));
      }

      const position = new Vector3();
      const rotation = new Quaternion();

      emitterMatrix(transform, emitter).decompose(
        position,
        rotation,
        new Vector3(),
      );

      emitters.push({
        position: position.toArray(),
        direction: new Vector3(
          ...readVector(emitterNode.emissionVector, [0, 0, 1]),
        )
          .applyQuaternion(rotation)
          .toArray(),
        range: readScalar(emitterNode.emissionRange, 0),
        radius: readScalar(emitterNode.radius, 0),
        layers,
      });
    }

    effects.push({
      position: transform["tc.worldTranslation"],
      delay,
      lodDistances: lodComponent
        ? times(4, (index) =>
            Math.min(
              lodComponent["lc.loddist"][`distance${index}`],
              Number.MAX_VALUE,
            ),
          )
        : undefined,
      emitters,
    });
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
