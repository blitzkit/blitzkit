import {
  bufferToBigInt,
  DdsReadStream,
  parseHierarchies,
  PvrReadStream,
  Sc2ReadStream,
  ScgReadStream,
  toUniqueId,
  type ConfigArchive,
  type TankParameters,
  type SC2,
  type Textures,
  type VehicleDefinitionList,
} from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import {
  Document,
  Material,
  Node,
  NodeIO,
  Scene,
} from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune } from "@gltf-transform/functions";
import type { APIContext } from "astro";
import { isEqual, times } from "lodash-es";
import { dirname } from "path";
import sharp from "sharp";
import {
  loadHierarchyMotions,
  Sc2ComponentHandler,
} from "../../../core/blitzkit/sc2Components";
import { partGarage } from "../../../core/blitzkit/switcherStates";
import { vfs } from "../../../core/blitzkit/vfs";

export { getStaticPaths } from "./_index";

export async function GET({ props }: APIContext<{ id: number }>) {
  const nodeIO = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const nations = await vfs
    .dir(`Data/XML/item_defs/vehicles`)
    .then((files) => files.filter((nation) => nation !== "common"));

  for (const nationIndex in nations) {
    const nation = nations[nationIndex];
    const tanks = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`,
    );
    const entries = Object.entries(tanks.root);

    for (const [tankKey, tank] of entries) {
      if (tankKey.includes("tutorial_bot")) continue;

      const id = toUniqueId(nation, tank.id);

      if (id !== props.id) continue;

      const parameters = await vfs.yaml<TankParameters>(
        `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
      );
      const model = await extractModel(
        vfs,
        parameters.resourcesPath.blitzModelPath.replace(/\.sc2$/, ""),
      );
      const bytes = await nodeIO.writeBinary(model);

      return new Response(bytes);
    }
  }
}

const ERROR_ON_UNKNOWN_COMPONENT = false;

const omitMeshNames = {
  start: [
    "chassis_chassis_",
    "chassis_track_crash_",
    "HP_",
    // mastery marks a new tank doesn't have yet
    "custom_gun_marks_",
  ],
  end: ["_POINT"],
};

export async function extractModel(
  vfs: AbstractVFS,
  path: string,
  isPart = false,
  preset?: string,
) {
  const sc2Path = `Data/3d/${path}.sc2`;
  const scgPath = `Data/3d/${path}.scg`;
  const sc2 = new Sc2ReadStream(
    (await vfs.file(sc2Path)).buffer as ArrayBuffer,
  ).sc2();
  const scg = new ScgReadStream(
    (await vfs.file(scgPath)).buffer as ArrayBuffer,
  ).scg();
  const document = new Document();
  const scene = document.createScene();
  const buffer = document.createBuffer();
  const materials = await extractMaterials(document, sc2, path);
  const garage = isPart ? partGarage(sc2, preset) : undefined;
  const handler = new Sc2ComponentHandler({
    document,
    buffer,
    scg,
    render: { kind: "visual", materials, isPart },
    skeleton: isPart
      ? { motions: await loadHierarchyMotions(vfs, path, sc2), garage }
      : undefined,
    strict: ERROR_ON_UNKNOWN_COMPONENT,
  });

  parseHierarchies<Scene | Node>(
    sc2["#hierarchy"],
    scene,
    (hierarchy, components, parent) => {
      if (
        omitMeshNames.start.some((omit) => hierarchy.name.startsWith(omit)) ||
        omitMeshNames.end.some((omit) => hierarchy.name.endsWith(omit))
      )
        return;

      const node = document.createNode(hierarchy.name);

      handler.handle(hierarchy, components, node);
      parent.addChild(node);

      return node;
    },
  );

  handler.resolveJointBindings();

  scene.addChild(document.createNode("test"));

  await document.transform(prune({ keepAttributes: true }), dedup());

  return document;
}

export async function extractMaterials(
  document: Document,
  sc2: SC2,
  path: string,
  config?: string,
) {
  const materials = new Map<bigint, Material | bigint | undefined>();

  for (const node of sc2["#dataNodes"]) {
    const id = bufferToBigInt(node["#id"]);

    if (node.parentMaterialKey !== undefined) {
      /**
       * material depends on a parent and doesn't seem to have any
       * properties so we just point it to the parent
       */
      materials.set(id, node.parentMaterialKey);
      continue;
    }

    let textures: Textures | undefined = undefined;

    if (config !== undefined) {
      if (typeof node.configCount !== "number") continue;

      const archive = times(
        node.configCount,
        (index) => node[`configArchive_${index}`],
      ).find((archive) => archive.configName === config);

      if (
        !archive ||
        isEqual(archive.textures, node.configArchive_0.textures)
      ) {
        continue;
      }

      textures = archive.textures;
    } else if (node.textures) {
      textures = node.textures;
    } else if (typeof node.configCount === "number") {
      textures = node.configArchive_0.textures;
    }

    const material = document.createMaterial(node.materialName);

    if (textures) {
      const baseColor = await readBaseColor(
        `Data/3d/${dirname(path)}/${textures.baseColorMap ?? textures.albedo}`,
      );
      material.setBaseColorTexture(
        document
          .createTexture(node.materialName)
          .setMimeType("image/webp")
          .setImage(baseColor),
      );

      let defaultConfigArchive: ConfigArchive | undefined = undefined;

      if (node.configCount) {
        const names = times(
          node.configCount,
          (index) => node[`configArchive_${index}`],
        );

        defaultConfigArchive = names.find(
          (archive) => archive.configName === "Default",
        );
        defaultConfigArchive ??= node.configArchive_0;
      }

      const customCullMode =
        node.customCullMode ?? defaultConfigArchive?.customCullMode;

      if (customCullMode === 0) {
        material.setDoubleSided(true);
      } else if (customCullMode !== undefined) {
        material.setDoubleSided(false);
      }

      if (
        node.enabledPresets?.AlphaTest &&
        node.properties?.alphatestThreshold
      ) {
        const view = new DataView(node.properties.alphatestThreshold);
        const alphaCutoff =
          view.byteLength < 4
            ? 0.5
            : view.getFloat32(view.byteLength - 4, true);

        material.setAlphaMode("MASK").setAlphaCutoff(alphaCutoff);
      }

      if (node.configCount) {
        for (
          let configIndex = 0;
          configIndex < node.configCount;
          configIndex++
        ) {
          const archive = node[`configArchive_${configIndex}`];

          if (
            archive.configName !== "Default" ||
            !archive.enabledPresets?.AlphaTest ||
            !archive.properties?.alphatestThreshold
          ) {
            continue;
          }

          const view = new DataView(archive.properties.alphatestThreshold);
          const alphaCutoff =
            view.byteLength < 4
              ? 0.5
              : view.getFloat32(view.byteLength - 4, true);

          material.setAlphaMode("MASK").setAlphaCutoff(alphaCutoff);
        }
      }

      const enabledPresets =
        node.enabledPresets ?? defaultConfigArchive?.enabledPresets;
      const fxName = node.fxName ?? defaultConfigArchive?.fxName;

      if (enabledPresets?.AlphaBlend || enabledPresets?.AlphaBlendAdditive) {
        material.setAlphaMode("BLEND");
      }

      if (enabledPresets?.AlphaBlendAdditive) {
        // gltf has no additive blending so the viewer applies it
        material.setExtras({ blending: "additive" });
      }

      if (fxName?.endsWith("/Textured.material")) {
        // unlit in game, emissive so the viewer can fade it with the lights
        material
          .setEmissiveTexture(material.getBaseColorTexture())
          .setEmissiveFactor([1, 1, 1])
          .setBaseColorFactor([0, 0, 0, 1]);
      }

      if (textures.miscMap) {
        material.setOcclusionTexture(
          document
            .createTexture(node.materialName)
            .setMimeType("image/webp")
            .setImage(
              await readOcclusion(
                `Data/3d/${dirname(path)}/${textures.miscMap}`,
              ),
            ),
        );
      }

      if (textures.baseRMMap) {
        material.setMetallicRoughnessTexture(
          document
            .createTexture(node.materialName)
            .setMimeType("image/webp")
            .setImage(
              await readRoughnessMetallic(
                `Data/3d/${dirname(path)}/${textures.baseRMMap}`,
              ),
            ),
        );
      }

      if (textures.baseNormalMap ?? textures.normalmap) {
        const isBase = textures.baseNormalMap !== undefined;

        material.setNormalTexture(
          document
            .createTexture(node.materialName)
            .setMimeType("image/webp")
            .setImage(
              await readNormal(
                `Data/3d/${dirname(path)}/${
                  textures.baseNormalMap ?? textures.normalmap
                }`,
                isBase,
              ),
            ),
        );
      }

      materials.set(id, material);
    }
  }

  // replace children materials with parents
  materials.forEach((material, id) => {
    if (typeof material !== "bigint") return;

    let resolvedMaterial: Material | bigint | undefined = material;

    while (typeof resolvedMaterial === "bigint") {
      const linkedParentMaterial = materials.get(resolvedMaterial);

      resolvedMaterial = linkedParentMaterial;
    }

    materials.set(id, resolvedMaterial);
  });

  return materials;
}

/**
 * the last few textures made, as a camouflage's parts share one atlas and a
 * tank's camouflages build one after another; it's capped so the build doesn't
 * keep every texture it ever made
 */
const IMAGE_CACHE_SIZE = 64;
const images = new Map<string, Promise<Buffer>>();

function cachedImage(key: string, read: () => Promise<Buffer>) {
  let image = images.get(key);

  if (!image) {
    image = read();
    images.set(key, image);

    if (images.size > IMAGE_CACHE_SIZE) {
      images.delete(images.keys().next().value!);
    }
  }

  return image;
}

function readBaseColor(path: string) {
  return cachedImage(`baseColor:${path}`, async () => {
    const raw = await readTexture(path);
    const image = await sharp(raw.data, { raw }).webp().toBuffer();

    return image;
  });
}

function readOcclusion(path: string) {
  return cachedImage(`occlusion:${path}`, async () => {
    const raw = await readTexture(path);

    const image = await sharp(raw.data, { raw })
      .extractChannel(3)
      .webp()
      .toBuffer();

    return image;
  });
}

function readRoughnessMetallic(path: string) {
  return cachedImage(`roughnessMetallic:${path}`, async () => {
    const raw = await readTexture(path);
    const blitz = sharp(raw.data, { raw });
    const metallicness = await blitz?.extractChannel(1).raw().toBuffer();
    const roughness = await blitz?.extractChannel(3).raw().toBuffer();

    const combined = Buffer.alloc(raw.width * raw.height * 3);

    for (let i = 0; i < raw.width * raw.height; i++) {
      combined[i * 3 + 1] = roughness[i];
      combined[i * 3 + 2] = metallicness[i];
    }

    const image = await sharp(combined, {
      raw: { width: raw.width, height: raw.height, channels: 3 },
    })
      .webp()
      .toBuffer();

    return image;
  });
}

function readNormal(path: string, isBase: boolean) {
  return cachedImage(`normal:${isBase}:${path}`, async () => {
    const raw = await readTexture(path);

    if (!isBase) {
      return await sharp(raw.data, { raw }).removeAlpha().jpeg().toBuffer();
    }

    const bytes = 4 * raw.width * raw.height;

    for (let index = 0; index < bytes; index += 4) {
      /**
       * Red is always 255 and blue is always 0. Only alpha and green contain
       * any sort of information.
       */
      let x = raw.data[index + 3] * (2 / 255) - 1;
      let y = raw.data[index + 1] * (2 / 255) - 1;
      let z = Math.sqrt(Math.max(0, 1 - x ** 2 - y ** 2));

      raw.data[index] = Math.round((x + 1) * (255 / 2));
      raw.data[index + 1] = Math.round((y + 1) * (255 / 2));
      raw.data[index + 2] = Math.round((z + 1) * (255 / 2));
      raw.data[index + 3] = 255;
    }

    return await sharp(raw.data, { raw }).webp().toBuffer();
  });
}

async function readTexture(path: string) {
  const ddsTexturePath = path.replace(".tex", ".dx11.dds");
  const isDds = await vfs.resolve(ddsTexturePath);
  const resolvedTexturePath = isDds
    ? ddsTexturePath
    : ddsTexturePath.replace(".dds", ".pvr");
  const file = await vfs.file(resolvedTexturePath);

  const raw = isDds
    ? await new DdsReadStream(file.buffer as ArrayBuffer).dds()
    : new PvrReadStream(file.buffer as ArrayBuffer).pvr();

  return raw;
}
