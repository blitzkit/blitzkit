import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import { Cache } from "three";
import { GLTFLoader } from "three-stdlib";

export function useDispose(gltf: any, path: string) {
  useEffect(() => {
    return () => {
      const disposedGeometries = new Set<string>();
      const disposedMaterials = new Set<string>();
      const disposedTextures = new Set<string>();

      gltf.scene.traverse((obj: any) => {
        if (obj.geometry) {
          const geometry = obj.geometry;

          if (!disposedGeometries.has(geometry.uuid)) {
            disposedGeometries.add(geometry.uuid);
            geometry.dispose();
          }
        }

        if (obj.material) {
          const materials = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];

          for (const material of materials) {
            if (!disposedMaterials.has(material.uuid)) {
              disposedMaterials.add(material.uuid);

              for (const key in material) {
                const value = material[key];

                if (
                  value &&
                  value.isTexture &&
                  !disposedTextures.has(value.uuid)
                ) {
                  disposedTextures.add(value.uuid);
                }
              }

              for (const key in material) {
                const value = material[key];

                if (value && value.isTexture) {
                  value.source.data.close();
                  value.dispose();
                }
              }

              material.dispose();
            }
          }
        }

        if (obj.skeleton) {
          obj.skeleton.dispose?.();
        }
      });

      useLoader.clear(GLTFLoader, path);
      Cache.remove(path);
    };
  }, [gltf, path]);
}
