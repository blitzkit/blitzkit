import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { SettingQuality3 } from "../config/settings";
import { useSetting } from "../hooks/useSetting";

interface Props {
  url: string;
  map: Record<string, boolean>;
}

export function TankModelPart({ url, map }: Props) {
  const tankQuality = useSetting<SettingQuality3>("tank_quality");
  const lightingQuality = useSetting<SettingQuality3>("lighting_quality");

  const gltf = useGLTF(url);
  const [root] = gltf.scene.children;

  useEffect(() => {
    for (const material of Object.values(gltf.materials)) {
      if (material instanceof MeshStandardMaterial) {
        // TODO: remove this hack and fix the gltf
        material.vertexColors = false;
        material.needsUpdate = true;

        if (tankQuality <= SettingQuality3.Medium) {
          material.normalMap = null;
        }

        if (tankQuality <= SettingQuality3.Low) {
          material.metalness = 0;
          material.roughness = 1;

          material.metalnessMap = null;
          material.roughnessMap = null;
        }

        if (tankQuality <= SettingQuality3.Medium) {
          material.aoMap = null;
        }
      }
    }

    for (const node of Object.values(gltf.nodes)) {
      if (node instanceof Mesh) {
        node.castShadow = lightingQuality >= SettingQuality3.Medium;
        node.receiveShadow = lightingQuality >= SettingQuality3.High;
      }
    }
  }, [url, tankQuality]);

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

  return <primitive object={root} />;
}
