import { VertexAttribute, type ScgReadStream } from "@blitzkit/core";
import { Primitive, type GLTF, type Skin } from "@gltf-transform/core";
import { times } from "lodash-es";
import {
  vertexAttributeGLTFName,
  vertexAttributeGltfVectorSizes,
} from "../../../pages/[...chunk_api]/tanks/[id]/collision.glb";
import type { MapMaterialExtras } from "../extras";
import { createAccessor, type MapContext } from "./context";
import {
  readFloats,
  treeVertexColors,
  type ResolvedMaterial,
} from "./materials";

export type PolygonGroup = NonNullable<
  ReturnType<ReturnType<ScgReadStream["scg"]>["get"]>
>;

const PRIMITIVE_MODES: Record<number, GLTF.MeshPrimitiveMode> = {
  1: Primitive.Mode.TRIANGLES,
  2: Primitive.Mode.TRIANGLE_STRIP,
  10: Primitive.Mode.LINES,
};

const CUSTOM_ATTRIBUTE_NAMES: Partial<Record<VertexAttribute, string>> = {
  [VertexAttribute.PIVOT4]: "_PIVOT",
  [VertexAttribute.FLEXIBILITY]: "_FLEXIBILITY",
  [VertexAttribute.ANGLE_SIN_COS]: "_ANGLE_SIN_COS",
};

export function primitiveMode(polygonGroup: PolygonGroup) {
  return (
    PRIMITIVE_MODES[polygonGroup.primitiveType] ?? Primitive.Mode.TRIANGLES
  );
}

export function readAttributes(polygonGroup: PolygonGroup) {
  const attributes = new Map<VertexAttribute, number[][]>();

  polygonGroup.vertices.forEach((vertex) => {
    vertex.forEach(({ attribute, value }) => {
      if (!attributes.has(attribute)) attributes.set(attribute, []);
      attributes.get(attribute)!.push(value);
    });
  });

  return attributes;
}

function skinPrimitive(
  context: MapContext,
  primitive: Primitive,
  attributes: Map<VertexAttribute, number[][]>,
  jointIndices: number[][],
  targetsData: ArrayBuffer | undefined,
) {
  const targets = new Uint32Array(new Uint8Array(targetsData!).slice().buffer);
  const weights =
    attributes.get(VertexAttribute.JOINTWEIGHT) ?? jointIndices.map(() => [1]);

  primitive
    .setAttribute(
      "JOINTS_0",
      createAccessor(
        context,
        "VEC4",
        new Uint16Array(
          jointIndices.flatMap((indices) =>
            times(4, (index) =>
              index < indices.length ? targets[indices[index]] ?? 0 : 0,
            ),
          ),
        ),
      ),
    )
    .setAttribute(
      "WEIGHTS_0",
      createAccessor(
        context,
        "VEC4",
        new Float32Array(
          weights.flatMap((vertexWeights) =>
            times(4, (index) => vertexWeights[index] ?? 0),
          ),
        ),
      ),
    );
}

export function createBatchPrimitive(
  context: MapContext,
  polygonGroup: PolygonGroup,
  { material, effective }: ResolvedMaterial,
  renderObject: Record<string, any>,
  batchIndex: number,
  skin: Skin | undefined,
) {
  const extras = material.getExtras() as unknown as MapMaterialExtras;
  const [offsetU, offsetV] = readFloats(effective.properties.uvOffset, 2) ?? [
    0, 0,
  ];
  const [scaleU, scaleV] = readFloats(effective.properties.uvScale, 2) ?? [
    1, 1,
  ];
  const primitive = context.document
    .createPrimitive()
    .setMode(primitiveMode(polygonGroup))
    .setIndices(
      createAccessor(context, "SCALAR", new Uint16Array(polygonGroup.indices)),
    )
    .setMaterial(material);
  const attributes = readAttributes(polygonGroup);

  if (
    extras.lightmap &&
    extras.lightmapTransform &&
    attributes.has(VertexAttribute.TEXCOORD1)
  ) {
    attributes.set(
      VertexAttribute.TEXCOORD1,
      attributes
        .get(VertexAttribute.TEXCOORD1)!
        .map(([u, v]) => [u * scaleU + offsetU, v * scaleV + offsetV]),
    );
  }

  if (extras.kind === "speedTree" && attributes.has(VertexAttribute.COLOR)) {
    primitive.setAttribute(
      "COLOR_0",
      createAccessor(
        context,
        "VEC3",
        new Float32Array(
          treeVertexColors(
            attributes.get(VertexAttribute.COLOR)!,
            effective,
            renderObject,
          ).flat(),
        ),
      ),
    );
  }

  if (extras.kind === "water" && attributes.has(VertexAttribute.TANGENT)) {
    primitive.setAttribute(
      "_TANGENT",
      createAccessor(
        context,
        "VEC3",
        new Float32Array(
          attributes
            .get(VertexAttribute.TANGENT)!
            .flatMap((tangent) => tangent.slice(0, 3)),
        ),
        "_TANGENT",
      ),
    );
  }

  attributes.forEach((value, attribute) => {
    const name =
      CUSTOM_ATTRIBUTE_NAMES[attribute] ?? vertexAttributeGLTFName[attribute];

    if (name === undefined || primitive.getAttribute(name) !== null) return;

    const vertexSize = vertexAttributeGltfVectorSizes[attribute];

    primitive.setAttribute(
      name,
      createAccessor(
        context,
        vertexSize === 1 ? "SCALAR" : `VEC${vertexSize}`,
        new Float32Array(value.flat()),
        name,
      ),
    );
  });

  if (primitive.getAttribute("POSITION") === null) return undefined;

  const jointIndices =
    attributes.get(VertexAttribute.JOINTINDEX) ??
    attributes.get(VertexAttribute.HARD_JOINTINDEX);
  if (skin && jointIndices) {
    skinPrimitive(
      context,
      primitive,
      attributes,
      jointIndices,
      renderObject[`skinnedObject.batch${batchIndex}.targetsData`],
    );
  }

  return { primitive, skinned: !!skin && !!jointIndices };
}
