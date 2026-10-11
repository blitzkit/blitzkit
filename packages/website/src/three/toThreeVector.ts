import type { Vector3 as BlitzKitVector } from "@blitzkit/protos";
import { Vector3 } from "three";

export function toThreeVector(vector?: BlitzKitVector) {
  return new Vector3(vector!.x, vector!.y, vector!.z);
}
