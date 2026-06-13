import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three-stdlib";
import { OnObjectUpdate } from "three/src/nodes/utils/EventNode.js";

export function useTankModel(url: string, map: Record<string, boolean>) {
  const gltf = useLoader(GLTFLoader, url);
  const [root] = gltf.scene.children;

  useEffect(() => {
    for (const material of Object.values(gltf.materials)) {
      if (material instanceof MeshStandardMaterial) {
        // TODO: remove this hack and fix the gltf
        material.vertexColors = false;
        material.needsUpdate = true;
      }
    }

    console.log(gltf.nodes);

    for (const node of Object.values(gltf.nodes)) {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    }
  }, [url]);

  useEffect(() => {
    for (const child of root.children) {
      if (child.name in map) {
        child.visible = map[child.name];
        continue;
      }

      child.visible = false;
      console.warn(`Root child ${child.name} isn't recognized`);
    }
  }, [url, map]);

  return root;
}
