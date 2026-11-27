import { invalidate, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Skin } from "./useSkin";

export function useSkinAnimation(skins: Skin[]) {
  // a hidden tab gets no frames, so the first one back carries all that time
  const resumed = useRef(false);

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) resumed.current = true;
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    // picks up where it paused rather than catching up
    const step = resumed.current ? 0 : delta;

    resumed.current = false;

    for (const { mixer, particles } of skins) {
      if (!mixer && particles.empty) continue;

      mixer?.update(step);
      particles.update(step, camera);
      invalidate();
    }
  });
}
