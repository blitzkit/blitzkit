import { invalidate, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { Fog } from "three";
import { fogAnimationTime, fogFar0, fogFar1, forNear0, forNear1 } from "..";
import { Tankopedia } from "../../../../../../stores/tankopedia";

export function InitialFogReveal() {
  const fog = useThree((state) => state.scene.fog as Fog | null);

  useEffect(() => {
    Tankopedia.mutate((draft) => {
      draft.revealed = true;
    });

    if (!fog) return;

    const t0 = Date.now();

    const interval = setInterval(() => {
      const t = (Date.now() - t0) / 1000;
      const x = t / fogAnimationTime;
      const near = forNear1 + (forNear0 - forNear1) * x;
      const far = fogFar1 + (fogFar0 - fogFar1) * x;

      fog.near = near;
      fog.far = far;
      invalidate();

      if (x >= 1) {
        fog.near = forNear0;
        fog.far = fogFar0;
        clearInterval(interval);
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  return null;
}
