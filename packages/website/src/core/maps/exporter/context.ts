import type { SC2, ScgReadStream } from "@blitzkit/core";
import type {
  Accessor,
  Buffer,
  Document,
  Node,
  Scene,
  TypedArray,
} from "@gltf-transform/core";

export type DataNode = Record<string, any>;

export interface MapContext {
  directory: string;
  sc2: SC2;
  scg: ReturnType<ScgReadStream["scg"]>;
  document: Document;
  scene: Scene;
  buffer: Buffer;
  dataNodes: DataNode[];
}

export function createAccessor(
  { document, buffer }: MapContext,
  type: ReturnType<Accessor["getType"]>,
  array: TypedArray,
  name?: string,
) {
  return document
    .createAccessor(name)
    .setType(type)
    .setArray(array)
    .setBuffer(buffer);
}

export function addExtras(property: Node | Scene, extras: object) {
  property.setExtras({ ...property.getExtras(), ...extras });

  return property;
}
