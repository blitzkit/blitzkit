import { useFrame } from "@react-three/fiber";

export function AutoClear() {
  useFrame(({ gl }) => {
    gl.clear();
  }, 0);

  return null;
}
