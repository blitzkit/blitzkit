import { ScpgReadStream, VertexAttribute } from "./scpg";

interface PolygonGroupRaw {
  "##name": "PolygonGroup";
  "#id": ArrayBuffer;
  cubeTextureCoordCount: number;
  indexCount: number;
  indexFormat: 0 | 1;
  indices: ArrayBuffer;
  packing: 0 | 1;
  primitiveCount: number;
  rhi_primitiveType: 1 | 2 | 10;
  textureCoordCount: number;
  vertexCount: number;
  vertexFormat: number;
  vertices: ArrayBuffer;
}

type BlitzkitVertex = { attribute: VertexAttribute; value: number[] }[];

interface BlitzkitPolygonGroup {
  vertices: BlitzkitVertex[];
  indices: number[];
}

const vertexAttributesArray = Object.values(VertexAttribute).filter(
  (value) => typeof value === "number",
);

export const vertexAttributeVectorSizes = {
  [VertexAttribute.VERTEX]: 3,
  [VertexAttribute.NORMAL]: 3,
  [VertexAttribute.COLOR]: 1,
  [VertexAttribute.TEXCOORD0]: 2,
  [VertexAttribute.TEXCOORD1]: 2,
  [VertexAttribute.TEXCOORD2]: 2,
  [VertexAttribute.TEXCOORD3]: 2,
  [VertexAttribute.TANGENT]: 3,
  [VertexAttribute.BINORMAL]: 3,
  [VertexAttribute.HARD_JOINTINDEX]: 1,
  [VertexAttribute.CUBETEXCOORD0]: 3,
  [VertexAttribute.CUBETEXCOORD1]: 3,
  [VertexAttribute.CUBETEXCOORD2]: 3,
  [VertexAttribute.CUBETEXCOORD3]: 3,
  [VertexAttribute.PIVOT4]: 4,
  [VertexAttribute.PIVOT_DEPRECATED]: 3,
  [VertexAttribute.FLEXIBILITY]: 1,
  [VertexAttribute.ANGLE_SIN_COS]: 2,
  [VertexAttribute.JOINTINDEX]: 4,
  [VertexAttribute.JOINTWEIGHT]: 4,
} as const;

export class ScgReadStream extends ScpgReadStream {
  header() {
    return {
      name: this.ascii(4),
      version: this.uint32(),
      nodeCount: this.uint32(),
      nodeCount2: this.uint32(),
    };
  }

  scg() {
    const header = this.header();
    const polygonGroupsRaw: PolygonGroupRaw[] = [];
    const polygonGroups = new Map<bigint, BlitzkitPolygonGroup>();

    for (let index = 0; index < header.nodeCount; index++) {
      const polygonGroupRaw = this.ka() as PolygonGroupRaw;
      polygonGroupsRaw.push(polygonGroupRaw);
    }

    polygonGroupsRaw.forEach((polygonGroupRaw) => {
      const indicesStream = new ScpgReadStream(polygonGroupRaw.indices);
      const indices: number[] = [];

      for (let index = 0; index < polygonGroupRaw.indexCount; index++) {
        indices.push(
          polygonGroupRaw.indexFormat === 0
            ? indicesStream.uint16()
            : indicesStream.uint32(),
        );
      }

      const verticesStream = new ScpgReadStream(polygonGroupRaw.vertices);
      const vertices: BlitzkitVertex[] = [];
      const { format, stride } = ScgReadStream.parseVertexFormat(
        polygonGroupRaw.vertexFormat,
      );
      const strideBasedSize = stride * polygonGroupRaw.vertexCount;

      if (verticesStream.buffer.byteLength !== strideBasedSize) {
        console.warn(
          `Vertex stride mismatch; expected ${strideBasedSize}, got ${verticesStream.buffer.byteLength}; skipping...`,
        );

        return;
      }

      for (let index = 0; index < polygonGroupRaw.vertexCount; index++) {
        vertices[index] = format.map((attribute) => ({
          attribute,
          value: verticesStream.vectorN(vertexAttributeVectorSizes[attribute]),
        }));
      }

      polygonGroups.set(
        new DataView(polygonGroupRaw["#id"]).getBigUint64(0, true),
        { vertices, indices },
      );
    });

    return polygonGroups;
  }

  static parseVertexFormat(formatInt: number) {
    const format: VertexAttribute[] = [];
    let stride = 0;

    vertexAttributesArray.forEach((attributeUntyped) => {
      const attribute = attributeUntyped as VertexAttribute;
      const mask = 1 << attribute;

      if (formatInt & mask) {
        format.push(attribute);
        stride += vertexAttributeVectorSizes[attribute] * 4;
      }
    });

    return { format, stride };
  }
}
