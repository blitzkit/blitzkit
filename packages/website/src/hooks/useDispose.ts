import { useLoader, type ObjectMap } from "@react-three/fiber";
import { useEffect } from "react";
import { Cache, Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import { GLTFLoader, type GLTF } from "three-stdlib";

export function useDispose(gltf: GLTF & ObjectMap, path: string) {
  useEffect(() => {
    return () => {
      gltf.scene.traverse((object) => {
        if (object instanceof Mesh) {
          if (object.material instanceof MeshStandardMaterial) {
            const maps = [
              object.material.map,
              object.material.aoMap,
              object.material.envMap,
              object.material.bumpMap,
              object.material.alphaMap,
              object.material.lightMap,
              object.material.normalMap,
              object.material.emissiveMap,
              object.material.roughnessMap,
              object.material.metalnessMap,
              object.material.displacementMap,
            ];

            for (const map of maps) {
              if (!map) continue;

              map.source.data.close();
              map.dispose();
            }

            object.material.dispose();
          } else {
            throw new TypeError(
              `Unexpected material type: ${object.material.type}`,
            );
          }
        } else if (object instanceof Group || object instanceof Object3D) {
          // traverse will get children
        } else {
          throw new TypeError(`Unexpected object type: ${object}`);
        }
      });

      useLoader.clear(GLTFLoader, path);
      Cache.remove(path);
    };
  }, [gltf, path]);
}
