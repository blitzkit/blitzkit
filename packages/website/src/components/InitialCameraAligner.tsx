import { useEffect } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import { Duel } from "../../../../../../stores/duel";
import { api } from "../api/dynamic";
import { applyPitchYawLimits } from "../core/blitz/applyPitchYawLimits";
import { modelTransformEvent } from "../core/blitzkit/modelTransform";

const modelDefinitions = await api.models();

export function InitialCameraAligner() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);

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
