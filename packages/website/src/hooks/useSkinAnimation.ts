import { invalidate, useFrame } from "@react-three/fiber";
import type { Skin } from "./useSkin";

export function useSkinAnimation(skins: Skin[]) {
  useFrame(({ camera }, delta) => {
    for (const { mixer, particles } of skins) {
      if (!mixer && particles.empty) continue;

      mixer?.update(delta);
      particles.update(delta, camera);
      invalidate();
    }
  });
}
