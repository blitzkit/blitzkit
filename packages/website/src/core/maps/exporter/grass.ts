import { EXTMeshGPUInstancing } from "@gltf-transform/extensions";
import { times } from "lodash-es";
import sharp from "sharp";
import type { MapMaterialExtras } from "../extras";
import { createAccessor, type DataNode, type MapContext } from "./context";
import { findComponent, hierarchyComponents } from "./hierarchy";
import { effectiveMaterial } from "./materials";
import { findLandscapeNode, loadHeightmap } from "./terrain";
import {
  losslessTexture,
  readMapTexture,
  setTextureSlot,
  type TextureLoader,
} from "./textures";

const GRASS_QUALITY_ORDER = ["HIGH", "MEDIUM", "LOW", "OFF"];
const DENSITY_MAP_RESOLUTION = 128;
const GRASS_SEED = 1;

function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;

    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function findVegetation({ sc2 }: MapContext) {
  return sc2["#hierarchy"]
    .flatMap((hierarchy) => {
      const components = hierarchyComponents(hierarchy);
      const renderObject = components.find(
        (component) =>
          component["rc.renderObj"]?.["##name"] === "VegetationRenderObject",
      )?.["rc.renderObj"];
      const quality = findComponent(
        components,
        "QualitySettingsComponent",
      )?.requiredQuality;

      return renderObject ? [{ renderObject, quality }] : [];
    })
    .sort(
      (a, b) =>
        GRASS_QUALITY_ORDER.indexOf(a.quality) -
        GRASS_QUALITY_ORDER.indexOf(b.quality),
    )[0]?.renderObject;
}

export async function createGrass(
  context: MapContext,
  materialNodes: Map<bigint, DataNode>,
  textures: TextureLoader,
  landscape: Record<string, any>,
) {
  const { document } = context;
  const vegetation = findVegetation(context);

  if (!vegetation) return;

  const chunkSet = vegetation["vro.geometryData"]["cgd.chunkSet"];
  const albedoPath = effectiveMaterial(
    materialNodes.get(BigInt(chunkSet["cgd.materialId"])),
    materialNodes,
  ).textures.albedo;
  const landscapeTextures = effectiveMaterial(
    findLandscapeNode(materialNodes, "tileMask"),
    materialNodes,
  ).textures;
  const tileMaskPath =
    landscapeTextures.tileMaskHeightBlend ?? landscapeTextures.tileMask;

  if (tileMaskPath === undefined) return;

  const [albedo, lightmap, densityScale] = await Promise.all([
    albedoPath ? textures.load(albedoPath, false) : null,
    textures.load(vegetation["vro.lightmap"], true),
    readMapTexture(context, vegetation["vro.lightmap"])
      .then((image) =>
        losslessTexture(
          context,
          `${vegetation["vro.lightmap"]}:density`,
          sharp(image.data, { raw: image }).extractChannel(3),
        ),
      )
      .catch(() => null),
  ]);

  if (!albedo) return;

  const { bounds, heightAtPosition } = await loadHeightmap(context, landscape);
  const [minX, minY, , maxX, maxY] = bounds;
  const material = document
    .createMaterial("grass")
    .setDoubleSided(true)
    .setExtras({
      kind: "grass",
      baseColorMultiplier: vegetation["vro.baseColorMultilplier"] ?? 1,
      visibilityDistance: Math.sqrt(vegetation["vro.visibilityDistance"][0]),
      mapBounds: [minX, minY, maxX, maxY],
      shadowReceiver: true,
    } satisfies MapMaterialExtras);

  setTextureSlot(document, material, "albedo", albedo);

  if (lightmap) setTextureSlot(document, material, "grassColor", lightmap);
  if (densityScale) {
    setTextureSlot(document, material, "grassDensity", densityScale);
  }

  const density = new Uint8Array(vegetation["vro.flippedDensityMap"]);
  const tileMask = await readMapTexture(context, tileMaskPath);
  const layerLimits: number[] = vegetation["vro.clusterLayerLimit"];
  const rotationVariation: number[] = vegetation["vro.rotationVariation"];
  const scaleVariation: number[] = vegetation["vro.scaleVariation"];
  const variationCount: number = chunkSet["cgd.variationsCount"];
  const cellWidth = (maxX - minX) / DENSITY_MAP_RESOLUTION;
  const cellHeight = (maxY - minY) / DENSITY_MAP_RESOLUTION;
  const random = seededRandom(GRASS_SEED);
  const instancing = document.createExtension(EXTMeshGPUInstancing);
  const grassNode = document.createNode("grass");

  function maskWeight(column: number, row: number, layer: number) {
    if (layer >= tileMask.channels) return 0;

    const x = Math.min(
      tileMask.width - 1,
      Math.floor(((column + 0.5) / DENSITY_MAP_RESOLUTION) * tileMask.width),
    );
    const y = Math.min(
      tileMask.height - 1,
      Math.floor((1 - (row + 0.5) / DENSITY_MAP_RESOLUTION) * tileMask.height),
    );

    return (
      tileMask.data[(y * tileMask.width + x) * tileMask.channels + layer] / 255
    );
  }

  for (let variation = 0; variation < variationCount; variation++) {
    const lod = chunkSet[`cgd.variation.${variation}`]["cgd.lod.0"];
    const translations: number[] = [];
    const rotations: number[] = [];
    const scales: number[] = [];

    for (let row = 0; row < DENSITY_MAP_RESOLUTION; row++) {
      for (let column = 0; column < DENSITY_MAP_RESOLUTION; column++) {
        if (!density[row * DENSITY_MAP_RESOLUTION + column]) continue;

        const expected =
          layerLimits[variation] * maskWeight(column, row, variation);
        const count = Math.floor(expected) + Number(random() < expected % 1);

        for (let index = 0; index < count; index++) {
          const x = minX + (column + random()) * cellWidth;
          const y = minY + (row + random()) * cellHeight;
          const angle =
            ((random() * 2 - 1) * rotationVariation[variation] * Math.PI) / 180;
          const scale = 1 + (random() * 2 - 1) * scaleVariation[variation];

          translations.push(x, y, heightAtPosition(x, y));
          rotations.push(0, 0, Math.sin(angle / 2), Math.cos(angle / 2));
          scales.push(scale, scale, scale);
        }
      }
    }

    const primitive = document
      .createPrimitive()
      .setMaterial(material)
      .setIndices(
        createAccessor(
          context,
          "SCALAR",
          new Uint16Array(
            times(
              lod["cgd.lod.indexCount"],
              (index) => lod[`cgd.lod.index.${index}`],
            ),
          ),
        ),
      )
      .setAttribute(
        "POSITION",
        createAccessor(
          context,
          "VEC3",
          new Float32Array(
            times(
              lod["cgd.lod.posCount"],
              (index) => lod[`cgd.lod.pos.${index}`],
            ).flat(),
          ),
        ),
      )
      .setAttribute(
        "TEXCOORD_0",
        createAccessor(
          context,
          "VEC2",
          new Float32Array(
            times(
              lod["cgd.lod.texCoordCount"],
              (index) => lod[`cgd.lod.tex.${index}`],
            ).flat(),
          ),
        ),
      );

    grassNode.addChild(
      document
        .createNode(`grass${variation}`)
        .setMesh(document.createMesh().addPrimitive(primitive))
        .setExtension(
          "EXT_mesh_gpu_instancing",
          instancing
            .createInstancedMesh()
            .setAttribute(
              "TRANSLATION",
              createAccessor(context, "VEC3", new Float32Array(translations)),
            )
            .setAttribute(
              "ROTATION",
              createAccessor(context, "VEC4", new Float32Array(rotations)),
            )
            .setAttribute(
              "SCALE",
              createAccessor(context, "VEC3", new Float32Array(scales)),
            ),
        ),
    );
  }

  return grassNode;
}
