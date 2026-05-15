import { asset } from "@blitzkit/core";
import { useLoader } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three-stdlib";
import { useDispose } from "./useDispose";

export function useModel(id: number) {
  const path = asset(`3d/tanks/models/${id}.glb`);
  const gltf = useLoader(GLTFLoader, path);

  useDispose(gltf, path);

  return {
    gltf,
    hasPbr: Object.values(gltf.nodes).some(
      (node) =>
        node instanceof Mesh &&
        node.material instanceof MeshStandardMaterial &&
        node.material.roughnessMap !== null,
    ),
  };
}
