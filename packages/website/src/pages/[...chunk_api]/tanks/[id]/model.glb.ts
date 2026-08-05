import {
  bufferToBigInt,
  DdsReadStream,
  PvrReadStream,
  Sc2ReadStream,
  ScgReadStream,
  toUniqueId,
  VertexAttribute,
  type ConfigArchive,
  type Hierarchy,
  type TankParameters,
  type Textures,
  type VehicleDefinitionList,
} from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import { Document, Material, Node, NodeIO, Scene } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune } from "@gltf-transform/functions";
import type { APIContext } from "astro";
import { times } from "lodash-es";
import { dirname } from "path";
import sharp from "sharp";
import { vfs } from "../../../../core/blitzkit/vfs";
import {
  vertexAttributeGLTFName,
  vertexAttributeGltfVectorSizes,
} from "./collision.glb";

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
  start: ["chassis_chassis_", "chassis_track_crash_", "HP_"],
  end: ["_POINT"],
};

async function extractModel(vfs: AbstractVFS, path: string) {
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

    const material = document.createMaterial(node.materialName);
    let textures: Textures | undefined = undefined;

    if (node.textures) {
      textures = node.textures;
    } else if (typeof node.configCount === "number") {
      textures = node.configArchive_0.textures;
    }

    if (textures) {
      const baseColor = await readBaseColor(
        `Data/3d/${dirname(path)}/${textures.baseColorMap ?? textures.albedo}`,
        textures.miscMap
          ? `Data/3d/${dirname(path)}/${textures.miscMap}`
          : undefined,
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

  function parseHierarchies(hierarchies: Hierarchy[], parent: Scene | Node) {
    hierarchies.forEach((hierarchy) => {
      if (
        omitMeshNames.start.some((omit) => hierarchy.name.startsWith(omit)) ||
        omitMeshNames.end.some((omit) => hierarchy.name.endsWith(omit))
      )
        return;

      const node = document.createNode(hierarchy.name);
      const components = times(
        hierarchy.components.count,
        (index) => hierarchy.components[index.toString().padStart(4, "0")],
      );

      components.forEach((component) => {
        switch (component["comp.typename"]) {
          case "LodComponent":
            // found and used later by transform component
            // TODO: lod component always shows up before transform component; cache it before parsing transform
            break;

          case "TransformComponent": {
            const localTranslation = component["tc.localTranslation"];
            // The game resets top-level node translation to [0, 0, 0] on load.
            // Child nodes must keep their authored local offsets.
            node.setTranslation(
              parent instanceof Scene ? [0, 0, 0] : localTranslation,
            );
            node.setRotation(component["tc.localRotation"]);
            node.setScale(component["tc.localScale"]);

            break;
          }

          case "RenderComponent": {
            const renderObject = component["rc.renderObj"];

            times(renderObject["ro.batchCount"], (batchIndex): void => {
              const lodIndex = renderObject[`rb${batchIndex}.lodIndex`];

              if (lodIndex !== 0) return;

              const batchKey = batchIndex.toString().padStart(4, "0");
              const batch = renderObject["ro.batches"][batchKey];
              const material = materials.get(batch["rb.nmatname"]);
              const polygonGroup = scg.get(batch["rb.datasource"]);

              if (!(material instanceof Material)) {
                // probably shadow material
                return;
              }
              if (polygonGroup === undefined) {
                throw new Error(
                  `Missing polygon group ${batch["rb.datasource"]}`,
                );
              }

              const lodNode = document.createNode(batchKey);
              const indicesAccessor = document
                .createAccessor()
                .setType("SCALAR")
                .setArray(new Uint16Array(polygonGroup.indices))
                .setBuffer(buffer);
              const primitive = document
                .createPrimitive()
                .setIndices(indicesAccessor)
                .setMaterial(material)
                .setName(batchKey);

              const attributes = new Map<VertexAttribute, number[][]>();

              polygonGroup.vertices.forEach((vertex) => {
                vertex.forEach(({ attribute, value }) => {
                  if (!attributes.has(attribute)) {
                    attributes.set(attribute, []);
                  }

                  attributes.get(attribute)!.push(value);
                });
              });

              attributes.forEach((value, attribute) => {
                const name = vertexAttributeGLTFName[attribute];

                if (
                  name === undefined ||
                  primitive.getAttribute(name) !== null
                ) {
                  return;
                }

                const vertexSize = vertexAttributeGltfVectorSizes[attribute];
                const attributeAccessor = document
                  .createAccessor(name)
                  .setType(vertexSize === 1 ? "SCALAR" : `VEC${vertexSize}`)
                  .setArray(new Float32Array(value.flat()))
                  .setBuffer(buffer);

                primitive.setAttribute(name, attributeAccessor);
              });

              const mesh = document
                .createMesh(batch["##name"])
                .addPrimitive(primitive);
              lodNode.setMesh(mesh);
              node.addChild(lodNode);
            });

            break;
          }

          default: {
            if (ERROR_ON_UNKNOWN_COMPONENT) {
              throw new Error(
                `Unhandled component type: ${component["comp.typename"]}`,
              );
            }
          }
        }
      });

      if (hierarchy["#hierarchy"]) {
        parseHierarchies(hierarchy["#hierarchy"], node);
      }

      parent.addChild(node);
    });
  }

  parseHierarchies(sc2["#hierarchy"], scene);

  scene.addChild(document.createNode("test"));

  await document.transform(prune({ keepAttributes: true }), dedup());

  return document;
}

async function readBaseColor(path: string, occlusionPath?: string) {
  const baseRaw = await readTexture(path);
  const occlusionRaw = occlusionPath
    ? await readTexture(occlusionPath)
    : undefined;
  const base = await sharp(baseRaw.data, { raw: baseRaw }).raw().toBuffer();
  const occlusion = occlusionRaw
    ? await sharp(occlusionRaw.data, { raw: occlusionRaw })
        .extractChannel(3)
        .raw()
        .toBuffer()
    : undefined;

  const combined = Buffer.alloc(baseRaw.width * baseRaw.height * 4);

  for (let i = 0; i < baseRaw.width * baseRaw.height; i++) {
    let c = 1;

    if (occlusionRaw) {
      const x = i % baseRaw.width;
      const y = Math.floor(i / baseRaw.width);
      const u = Math.floor(x * (occlusionRaw.width / baseRaw.width));
      const v = Math.floor(y * (occlusionRaw.height / baseRaw.height));

      const occlusionI = u + v * occlusionRaw.width;

      c = occlusion![occlusionI] / 255;
    }

    const alpha = base[i * 4 + 3];

    combined[i * 4 + 0] = Math.round(base[i * 4 + 0] * c);
    combined[i * 4 + 1] = Math.round(base[i * 4 + 1] * c);
    combined[i * 4 + 2] = Math.round(base[i * 4 + 2] * c);
    combined[i * 4 + 3] = alpha;
  }

  const image = await sharp(combined, {
    raw: { width: baseRaw.width, height: baseRaw.height, channels: 4 },
  })
    .webp()
    .toBuffer();

  return image;
}

async function readRoughnessMetallic(path: string) {
  const raw = await readTexture(path);
  const blitz = sharp(raw.data, { raw: raw });
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
}

async function readNormal(path: string, isBase: boolean) {
  const raw = await readTexture(path);

  if (!isBase) {
    return await sharp(raw.data, { raw }).removeAlpha().jpeg().toBuffer();
  }

  const bytes = 4 * raw.width * raw.height;

  for (let index = 0; index < bytes; index += 4) {
    /**
     * Red is always 255 and blue is always 0. Only alpha and green contain any
     * sort of information.
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
