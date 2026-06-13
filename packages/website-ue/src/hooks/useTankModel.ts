import { useLoader } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three-stdlib";

export function useTankModel(url: string, map: Record<string, boolean>) {
  const gltf = useLoader(GLTFLoader, url);
  const [root] = gltf.scene.children;

  root.traverse((child) => {
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

  for (const child of root.children) {
    if (child.name in map) {
      child.visible = map[child.name];
      continue;
    }

    child.visible = false;
    console.warn(`Root child ${child.name} isn't recognized`);
  }

  return root;
}
