import type { Vector3 as BlitzkitVector3 } from "@blitzkit/protos";
import { Vector3 as THREEVector3 } from "three";
import { rotateDavaVector } from "./rotateDavaVector";

export function correctZYTuple(tuple: BlitzkitVector3) {
  return rotateDavaVector(new THREEVector3(tuple.x, tuple.y, -tuple.z));
}
