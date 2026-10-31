import {
  bufferToBigInt,
  DdsReadStream,
  parseHierarchies,
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
import {
  Document,
  Material,
  Node,
  NodeIO,
  Scene,
  type Skin,
} from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune } from "@gltf-transform/functions";
import type { APIContext } from "astro";
import { isEqual, times } from "lodash-es";
import { dirname } from "path";
import sharp from "sharp";
import type { Motion } from "../../../core/blitzkit/skinAnimations/motion";
import {
  bindSocket,
  createMotionClip,
  createSkeleton,
  loadMotion,
  skinPrimitive,
} from "../../../core/blitzkit/skinAnimations/skeleton";
import { partGarage } from "../../../core/blitzkit/switcherStates";
import { vfs } from "../../../core/blitzkit/vfs";
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
  const skeletons = new Map<Hierarchy, ReturnType<typeof createSkeleton>>();
  const jointBindings: [
    owner: Node,
    entity: string,
    joint: Node,
    skin: Skin,
  ][] = [];
  const motions = new Map<Hierarchy, Motion>();
  const garageMotions = isPart ? partGarage(sc2, preset).motions : new Set();

  if (isPart) {
    const loading: Promise<void>[] = [];

    parseHierarchies(sc2["#hierarchy"], null, (hierarchy, components) => {
      for (const component of components) {
        if (component["comp.typename"] !== "MotionComponent") continue;

        loading.push(
          loadMotion(vfs, path, component).then((motion) => {
            motions.set(hierarchy, motion);
          }),
        );
      }

      return null;
    });

    await Promise.all(loading);
  }

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

      if (isPart) {
        const skeleton = components.find(
          (component) => component["comp.typename"] === "SkeletonComponent",
        );
        const motionComponent = components.find(
          (component) => component["comp.typename"] === "MotionComponent",
        );
        const motion = motions.get(hierarchy);

        if (skeleton) {
          const created = createSkeleton(
            document,
            buffer,
            node,
            skeleton,
            motion,
          );

          skeletons.set(hierarchy, created);

          // only what loops in the garage is exported
          if (motion && motionComponent && garageMotions.has(hierarchy)) {
            createMotionClip(
              document,
              buffer,
              `motion${document.getRoot().listAnimations().length}`,
              created.joints,
              motion,
              motionComponent,
            );
          }
        }
      }

      components.forEach((component) => {
        switch (component["comp.typename"]) {
          case "LodComponent":
            // found and used later by transform component
            // TODO: lod component always shows up before transform component; cache it before parsing transform
            break;

          case "TransformComponent": {
            const localTranslation = component["tc.localTranslation"];
            // The game resets top-level node translation to [0, 0, 0] on load.
            // Child nodes and customization parts must keep their authored
            // local offsets.
            node.setTranslation(
              parent instanceof Scene && !isPart ? [0, 0, 0] : localTranslation,
            );
            node.setRotation(component["tc.localRotation"]);
            node.setScale(component["tc.localScale"]);

            break;
          }

          case "StateSwitcherComponent":
            node.setExtras({
              state: component[`ssc.state${component["ssc.activeState"]}`],
            });
            break;

          case "SkeletonJointBindingComponent": {
            const skeleton = skeletons.get(hierarchy);

            if (!skeleton) break;

            times(component.count, (index) => {
              const binding = component.map[
                index.toString().padStart(4, "0")
              ] as unknown as { entityUid: string; jointUid: string };
              const joint = skeleton.joints.get(binding.jointUid);

              if (!joint) throw new Error(`Missing joint ${binding.jointUid}`);

              jointBindings.push([
                node,
                binding.entityUid,
                joint,
                skeleton.skin,
              ]);
            });
            break;
          }

          case "RenderComponent": {
            const renderObject = component["rc.renderObj"];

            times(renderObject["ro.batchCount"], (batchIndex): void => {
              const lodIndex = renderObject[`rb${batchIndex}.lodIndex`];

              // -1 means the batch has no lods and is always drawn
              if (lodIndex !== 0 && !(isPart && lodIndex === -1)) return;

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

              const skeleton = skeletons.get(hierarchy);
              const mesh = document
                .createMesh(batch["##name"])
                .addPrimitive(primitive);
              lodNode.setMesh(mesh);

              if (
                skeleton &&
                skinPrimitive(
                  document,
                  buffer,
                  primitive,
                  attributes,
                  renderObject[`skinnedObject.batch${batchIndex}.targetsData`],
                )
              ) {
                lodNode.setSkin(skeleton.skin);
              }
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

      parent.addChild(node);

      return node;
    },
  );

  for (const [owner, entity, joint, skin] of jointBindings) {
    const socket = findNode(owner, entity);

    if (!socket) throw new Error(`Missing socket ${entity}`);

    bindSocket(socket, joint, skin);
  }

  scene.addChild(document.createNode("test"));

  await document.transform(prune({ keepAttributes: true }), dedup());

  return document;
}

function findNode(node: Node, name: string): Node | undefined {
  for (const child of node.listChildren()) {
    if (child.getName() === name) return child;

    const found = findNode(child, name);

    if (found) return found;
  }
}

export async function extractMaterials(
  document: Document,
  sc2: ReturnType<Sc2ReadStream["sc2"]>,
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

async function readBaseColor(path: string) {
  const raw = await readTexture(path);
  const image = await sharp(raw.data, { raw }).webp().toBuffer();

  return image;
}

async function readOcclusion(path: string) {
  const raw = await readTexture(path);

  const image = await sharp(raw.data, { raw })
    .extractChannel(3)
    .webp()
    .toBuffer();

  return image;
}

async function readRoughnessMetallic(path: string) {
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
