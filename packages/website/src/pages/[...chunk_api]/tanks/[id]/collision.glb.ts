import {
  Sc2ReadStream,
  ScgReadStream,
  toUniqueId,
  VertexAttribute,
  vertexAttributeVectorSizes,
  type Hierarchy,
  type VehicleDefinitionList,
} from "@blitzkit/core";
import type { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import { Accessor, Document, Node, NodeIO, Scene } from "@gltf-transform/core";
import type { APIContext } from "astro";
import { times } from "lodash-es";
import { vfs } from "../../../../core/blitzkit/vfs";

export { getStaticPaths } from "./_index";

export async function GET({ props }: APIContext<{ id: number }>) {
  const nodeIO = new NodeIO();
  const nations = await vfs
    .dir(`Data/XML/item_defs/vehicles`)
    .then((files) => files.filter((nation) => nation !== "common"));

  for (const nation of nations) {
    const tanks = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`,
    );

    for (const tankKey in tanks.root) {
      const tank = tanks.root[tankKey];

      if (tankKey.includes("tutorial_bot")) continue;

      const id = toUniqueId(nation, tank.id);

      if (id !== props.id) continue;

      const model = await extractArmor(vfs, `${nation}-${tankKey}`);
      const bytes = await nodeIO.writeBinary(model);

      return new Response(bytes);
    }
  }
}

async function extractArmor(vfs: AbstractVFS, fileName: string) {
  const sc2Path = `Data/3d/Tanks/CollisionMeshes/${fileName}.sc2`;
  const scgPath = `Data/3d/Tanks/CollisionMeshes/${fileName}.scg`;
  const sc2 = new Sc2ReadStream(
    (await vfs.file(sc2Path)).buffer as ArrayBuffer,
  ).sc2();
  const scg = new ScgReadStream(
    (await vfs.file(scgPath)).buffer as ArrayBuffer,
  ).scg();
  const document = new Document();
  const scene = document.createScene();
  const buffer = document.createBuffer();

  function parseHierarchies(hierarchies: Hierarchy[], parent: Scene | Node) {
    hierarchies.forEach((hierarchy) => {
      const components = times(
        hierarchy.components.count,
        (index) => hierarchy.components[index.toString().padStart(4, "0")],
      );

      components.forEach((component) => {
        switch (component["comp.typename"]) {
          case "TransformComponent":
            break;

          case "RenderComponent": {
            const batch = component["rc.renderObj"]["ro.batches"]["0000"];
            const polygonGroup = scg.get(batch["rb.datasource"]);

            if (!polygonGroup) {
              console.warn(
                `Missing polygon group ${batch["rb.datasource"]} (${hierarchy.name}); skipping...`,
              );

              break;
            }

            const hardJointIndices = new Set<number>();
            const vertexHardJointIndices = new Map<number, number>();
            const attributes = new Map<VertexAttribute, number[][]>();

            polygonGroup.vertices.forEach((vertex, index) => {
              vertex.forEach(({ attribute, value }) => {
                if (!attributes.has(attribute)) {
                  attributes.set(attribute, []);
                }

                attributes.get(attribute)!.push(value);

                if (attribute === VertexAttribute.HARD_JOINTINDEX) {
                  hardJointIndices.add(value[0]);
                  vertexHardJointIndices.set(index, value[0]);
                }
              });
            });

            if (attributes.has(VertexAttribute.TANGENT)) {
              attributes.set(
                VertexAttribute.TANGENT,
                attributes
                  .get(VertexAttribute.TANGENT)!
                  .map((tangent) => [...tangent, 1]),
              );
            }

            const accessors = new Map<string, Accessor>();

            attributes.forEach((value, attribute) => {
              const name = vertexAttributeGLTFName[attribute];
              if (!name || accessors.has(name)) return;
              const vertexSize = vertexAttributeGltfVectorSizes[attribute];
              const accessor = document
                .createAccessor(name)
                .setType(vertexSize === 1 ? "SCALAR" : `VEC${vertexSize}`)
                .setArray(new Float32Array(value.flat()))
                .setBuffer(buffer);

              accessors.set(name, accessor);
            });

            hardJointIndices.forEach((hardJointIndex) => {
              const node = document.createNode(
                `${hierarchy.name}_armor_${hardJointIndex}`,
              );
              const mesh = document.createMesh(batch["##name"]);
              const indicesAccessor = document
                .createAccessor()
                .setType("SCALAR")
                .setArray(
                  new Uint16Array(
                    polygonGroup.indices.filter(
                      (index) =>
                        vertexHardJointIndices.get(index) === hardJointIndex,
                    ),
                  ),
                )
                .setBuffer(buffer);
              const primitive = document
                .createPrimitive()
                .setIndices(indicesAccessor);

              accessors.forEach((accessor, name) => {
                primitive.setAttribute(name, accessor);
              });

              mesh.addPrimitive(primitive);
              node.setMesh(mesh);
              parent.addChild(node);
            });

            break;
          }

          default:
            throw new TypeError(
              `Unhandled component type: ${component["comp.typename"]}`,
            );
        }
      });

      if (hierarchy["#hierarchy"]) {
        parseHierarchies(hierarchy["#hierarchy"], parent);
      }
    });
  }

  parseHierarchies(sc2["#hierarchy"], scene);

  return document;
}

export const vertexAttributeGLTFName: Partial<Record<VertexAttribute, string>> =
  {
    [VertexAttribute.VERTEX]: "POSITION",
    [VertexAttribute.NORMAL]: "NORMAL",
    [VertexAttribute.TEXCOORD0]: "TEXCOORD_0",
    [VertexAttribute.TEXCOORD1]: "TEXCOORD_1",
    [VertexAttribute.TEXCOORD2]: "TEXCOORD_2",
    [VertexAttribute.TEXCOORD3]: "TEXCOORD_3",
  };
export const vertexAttributeGltfVectorSizes = {
  ...vertexAttributeVectorSizes,
  [VertexAttribute.TANGENT]: 4,
} as const;
