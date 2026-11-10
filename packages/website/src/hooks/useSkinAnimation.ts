import { invalidate, useFrame } from "@react-three/fiber";
import { Tankopedia } from "../stores/tankopedia";
import type { Skin } from "./useSkin";

export function useSkinAnimation(skins: Skin[]) {
  const animate = Tankopedia.use((state) => state.animate);

  useFrame((_, delta) => {
    if (animate) return;

    for (const { mixer } of skins) {
      if (!mixer) continue;

      mixer.update(delta);
      invalidate();
    }
  });
}
