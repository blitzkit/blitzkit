import type { mat4, vec3, vec4 } from "@gltf-transform/core";
import { Matrix4 } from "three";

/**
 * SC2 is Z-up; glTF is Y-up. The basis change C is a -90° rotation about X:
 * (x, y, z) -> (x, z, -y). Points and directions map through C, rotations and
 * matrices are conjugated (C M C⁻¹), and scales swap their Y and Z factors.
 */

const C = new Matrix4().makeRotationX(-Math.PI / 2);
const C_INVERSE = new Matrix4().makeRotationX(Math.PI / 2);

export function sc2ToGltfVector(vector: readonly number[]): vec3 {
  return [vector[0], vector[2], -vector[1]];
}

/** (x, y, z, w) quaternion */
export function sc2ToGltfQuaternion(q: readonly number[]): vec4 {
  return [q[0], q[2], -q[1], q[3]];
}

export function sc2ToGltfScale(scale: readonly number[]): vec3 {
  return [scale[0], scale[2], scale[1]];
}

/** anything indexable by number, e.g. a plain array or a typed array */
type NumberArray = { [index: number]: number; length: number };

/** column-major 4x4 */
export function sc2ToGltfMatrix(matrix: readonly number[]): mat4 {
  return new Matrix4()
    .multiplyMatrices(C, new Matrix4().fromArray(matrix))
    .multiply(C_INVERSE)
    .toArray() as mat4;
}

/** Converts a flat list of tightly packed vec3s in place. */
export function sc2ToGltfVectors<T extends NumberArray>(array: T) {
  for (let i = 0; i < array.length; i += 3) {
    const y = array[i + 1];

    array[i + 1] = array[i + 2];
    array[i + 2] = -y;
  }

  return array;
}

/** Converts a flat list of tightly packed quaternions in place. */
export function sc2ToGltfQuaternions<T extends NumberArray>(array: T) {
  for (let i = 0; i < array.length; i += 4) {
    const y = array[i + 1];

    array[i + 1] = array[i + 2];
    array[i + 2] = -y;
  }

  return array;
}
