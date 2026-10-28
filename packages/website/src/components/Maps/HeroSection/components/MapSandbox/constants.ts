import { Vector3 } from "three";

export const DEFAULT_EXTENT = 300;

export function initialCamera(extent: number) {
  return new Vector3(0, extent * 1.15, extent * 1.5);
}
