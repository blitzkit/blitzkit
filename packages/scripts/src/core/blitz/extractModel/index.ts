import {
  Hierarchy,
  Sc2ReadStream,
  ScgReadStream,
  Textures,
  VertexAttribute,
} from "@blitzkit/core";
import { Document, Material, Node, Scene } from "@gltf-transform/core";
import { dedup, prune } from "@gltf-transform/functions";
import { times } from "lodash-es";
import { dirname } from "path";
import { SteamVFS } from "../../vfs/steam";
import { readBaseColor } from "../readBaseColor";
import { readNormal } from "../readNormal";
import { readRoughnessMetallic } from "../readRoughnessMetallic";
import {
  vertexAttributeGLTFName,
  vertexAttributeGltfVectorSizes,
} from "./constants";

const ERROR_ON_UNKNOWN_COMPONENT = false;

const omitMeshNames = {
  start: ["chassis_chassis_", "chassis_track_crash_", "HP_"],
  end: ["_POINT"],
};

export async function extractModel(vfs: SteamVFS, path: string) {
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
    const id = new DataView(node["#id"]).getBigUint64(0, true);

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
      const { image: baseColor, hasAlpha } = await readBaseColor(
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

      if (node.configCount) {
        for (
          let configIndex = 0;
          configIndex < node.configCount;
          configIndex++
        ) {
          if (!hasAlpha) continue;
          material.setAlphaMode("BLEND").setDoubleSided(true);
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

      materials.set(new DataView(node["#id"]).getBigUint64(0, true), material);
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
            node.setTranslation(component["tc.localTranslation"]);
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
