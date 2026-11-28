import type { ProtoVector3 } from "@blitzkit/protos";
import { Vector3 } from "three";

export function toThreeVector(vector?: ProtoVector3) {
  return new Vector3(vector!.x, vector!.y, vector!.z);
}
