import { asset } from "@blitzkit/core";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import { useDispose } from "./useDispose";

export function useArmor(id: number) {
  const path = asset(`3d/tanks/armor/${id}.glb`);
  const gltf = useLoader(GLTFLoader, path);

  useDispose(gltf, path);

  return {
    gltf,
    hasDynamicArmor: Object.values(gltf.nodes).some(
      (node) =>
        node.name.includes("state_00") || node.name.includes("state_01"),
    ),
  };
}
