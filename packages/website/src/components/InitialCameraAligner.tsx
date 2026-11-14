import { useEffect } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import { applyPitchYawLimits } from "../core/blitz/applyPitchYawLimits";
import { modelTransformEvent } from "../core/blitzkit/modelTransform";
import { useDuelModels } from "../hooks/useDuelModels";

export function InitialCameraAligner() {
  const { turret, gun } = useDuelModels("protagonist");

  useEffect(() => {
    const [pitch, yaw] = applyPitchYawLimits(
      degToRad(8),
      degToRad(25),
      gun.pitch!,
      turret.yaw,
    );

    modelTransformEvent.dispatch({ pitch, yaw });
  }, []);

  return null;
}
