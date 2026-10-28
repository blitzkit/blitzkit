import { alias } from "@blitzkit/core";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader, MeshoptDecoder } from "three-stdlib";
import { useDispose } from "./useDispose";

export function useMapModel(id: number) {
  const path = alias("api", `/maps/${id}/model.glb`);
  const gltf = useLoader(GLTFLoader, path, (loader) =>
    loader.setMeshoptDecoder(MeshoptDecoder()),
  );

  useDispose(gltf, path);

  return gltf;
}
