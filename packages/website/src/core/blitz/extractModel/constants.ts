import { VertexAttribute, vertexAttributeVectorSizes } from '@blitzkit/core';

export const vertexAttributeGLTFName: Partial<Record<VertexAttribute, string>> =
  {
    [VertexAttribute.VERTEX]: 'POSITION',
    [VertexAttribute.NORMAL]: 'NORMAL',
    [VertexAttribute.TEXCOORD0]: 'TEXCOORD_0',
    [VertexAttribute.TEXCOORD1]: 'TEXCOORD_0',
    [VertexAttribute.TEXCOORD2]: 'TEXCOORD_0',
    [VertexAttribute.TEXCOORD3]: 'TEXCOORD_0',
    [VertexAttribute.TANGENT]: 'TANGENT',
    [VertexAttribute.JOINTINDEX]: 'JOINT_0',
    [VertexAttribute.JOINTWEIGHT]: 'WEIGHT_0',
  };
export const vertexAttributeGltfVectorSizes = {
  ...vertexAttributeVectorSizes,
  [VertexAttribute.TANGENT]: 4,
} as const;
