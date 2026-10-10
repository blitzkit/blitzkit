import { bufferToBigInt, Sc2ReadStream, ScgReadStream } from "@blitzkit/core";
import { Document, NodeIO } from "@gltf-transform/core";
import {
  ALL_EXTENSIONS,
  EXTMeshoptCompression,
} from "@gltf-transform/extensions";
import { dedup, prune, reorder } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { vfs } from "../../blitzkit/vfs";
import type { MapSceneExtras } from "../extras";
import { mapsYamlEntry } from "../mapsYamlEntry";
import { createAnimator, loadMotions } from "./animation";
import { addBorder } from "./border";
import { addExtras, type DataNode, type MapContext } from "./context";
import { createGrass } from "./grass";
import { createMaterialResolver, readFloats } from "./materials";
import { createParticles } from "./particles";
import { buildScene } from "./scene";
import { compileScript } from "./script";
import { createTerrain } from "./terrain";
import { createTextureLoader } from "./textures";

const DEFAULT_SHADOW_COLOR = [0.7109, 0.8169, 1];

export async function mapModelBinary(id: number) {
  const nodeIO = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
  const map = await mapsYamlEntry(id);
  const model = await extractMapModel(
    `Maps/${map.localName.replace(/\.sc2$/, "")}`,
    map.tags,
  );

  return nodeIO.writeBinary(model);
}

function dataNodesNamed(dataNodes: DataNode[], name: string) {
  return new Map(
    dataNodes
      .filter((node) => node["##name"] === name)
      .map((node) => [bufferToBigInt(node["#id"]), node]),
  );
}

export async function extractMapModel(scenePath: string, tags?: string) {
  const directory = scenePath.slice(0, scenePath.lastIndexOf("/"));
  const sc2 = new Sc2ReadStream(
    (await vfs.file(`Data/3d/${scenePath}.sc2`)).buffer as ArrayBuffer,
  ).sc2();
  const scg = new ScgReadStream(
    (await vfs.file(`Data/3d/${scenePath}.scg`)).buffer as ArrayBuffer,
  ).scg();
  const document = new Document();
  const context: MapContext = {
    directory,
    sc2,
    scg,
    document,
    scene: document.createScene(),
    buffer: document.createBuffer(),
    dataNodes: sc2["#dataNodes"] as DataNode[],
  };
  const materialNodes = dataNodesNamed(context.dataNodes, "NMaterial");
  const animationData = dataNodesNamed(context.dataNodes, "AnimationData");
  const textures = createTextureLoader(context);
  const materials = createMaterialResolver(context, materialNodes, textures);
  const renderConfig = context.dataNodes.find(
    (node) => node["##name"] === "SceneRenderConfig",
  );

  await materials.preload();
  addExtras(context.scene, {
    shadowColor:
      readFloats(renderConfig?.properties?.shadowColor, 4)?.slice(0, 3) ??
      DEFAULT_SHADOW_COLOR,
  } satisfies MapSceneExtras);
  addBorder(context, tags);

  const motions = await loadMotions(context, sc2["#hierarchy"]);
  const animator = createAnimator(context, animationData, motions);
  const script = compileScript(sc2["#hierarchy"], animator);
  const terrains = buildScene(context, materials, animator, script);
  const particles = await createParticles(context);

  if (particles) context.scene.addChild(particles);

  for (const { node, renderObject } of terrains) {
    node.addChild(await createTerrain(context, materialNodes, renderObject));
  }

  if (terrains[0]) {
    const grass = await createGrass(
      context,
      materialNodes,
      textures,
      terrains[0].renderObject,
    );

    if (grass) context.scene.addChild(grass);
  }

  await MeshoptEncoder.ready;
  await document.transform(
    prune({ keepAttributes: true, keepSolidTextures: true }),
    dedup(),
    reorder({ encoder: MeshoptEncoder, target: "size" }),
  );

  document
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({
      method: EXTMeshoptCompression.EncoderMethod.QUANTIZE,
    });

  return document;
}
