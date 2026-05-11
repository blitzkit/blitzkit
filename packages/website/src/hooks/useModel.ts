import { asset } from "@blitzkit/core";
import { type ObjectMap, useLoader } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { type GLTF, GLTFLoader } from "three-stdlib";

export function useModel(id: number) {
  const gltf = useLoader(GLTFLoader, asset(`3d/tanks/models/${id}.glb`));

  return {
    gltf,
    hasPbr: Object.values(gltf.nodes).some(
      (node) =>
        node instanceof Mesh &&
        node.material instanceof MeshStandardMaterial &&
        node.material.roughnessMap !== null
    ),
  };
}
