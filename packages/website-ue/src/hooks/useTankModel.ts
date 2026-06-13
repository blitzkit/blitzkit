import { useLoader } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three-stdlib";

export function useTankModel(url: string) {
  const collision = false;
  const gltf = useLoader(GLTFLoader, url);

  gltf.scene.traverse((child) => {
    if (
      child instanceof Mesh &&
      child.material instanceof MeshStandardMaterial
    ) {
      // TODO: remove this hack and fix the gltf
      child.material.vertexColors = false;
    }

    child.castShadow = true;
    child.receiveShadow = true;
  });

  for (const child of gltf.scene.children) {
    child.visible = (child.name === "CollisionMesh") === collision;
  }

  return gltf.scene;
}
