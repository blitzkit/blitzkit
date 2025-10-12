import { Vector3 } from "three";
import { BoundingBox } from "../protos";

export function normalizeBoundingBox(boundingBox: BoundingBox) {
  return {
    x: boundingBox.max.x - boundingBox.min.x,
    y: boundingBox.max.y - boundingBox.min.y,
    z: boundingBox.max.z - boundingBox.min.z,
  } satisfies Vector3;
}
