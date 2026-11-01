import { invalidate, useFrame } from "@react-three/fiber";
import type { Skin } from "./useSkin";

export function useSkinAnimation(skins: Skin[]) {
  useFrame((_, delta) => {
    for (const { mixer } of skins) {
      if (!mixer) continue;

      mixer.update(delta);
      invalidate();
    }
  });
}
