import { useEffect } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import { api } from "../api/dynamic";
import { applyPitchYawLimits } from "../core/blitz/applyPitchYawLimits";
import { modelTransformEvent } from "../core/blitzkit/modelTransform";
import { DuelModule, useDuel } from "../hooks/useDuel";

const modelDefinitions = await api.models();

export function InitialCameraAligner() {
  const tank = useDuel("protagonist", DuelModule.Tank);
  const turret = useDuel("protagonist", DuelModule.Turret);
  const gun = useDuel("protagonist", DuelModule.Gun);

  const tankModel = modelDefinitions.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];
  const gunModel = turretModel.guns[gun.id];

  useEffect(() => {
    const [pitch, yaw] = applyPitchYawLimits(
      degToRad(8),
      degToRad(25),
      gunModel.pitch!,
      turretModel.yaw,
    );

    modelTransformEvent.dispatch({ pitch, yaw });
  }, []);

  return null;
}
