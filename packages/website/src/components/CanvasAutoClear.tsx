import { useFrame } from "@react-three/fiber";

export function CanvasAutoClear() {
  useFrame(({ gl }) => {
    gl.clear();
  }, 0);

  return null;
}
