import { useEffect } from 'react';
import { degToRad } from 'three/src/math/MathUtils.js';
import { awaitableModelDefinitions } from '../../../../../../core/awaitables/modelDefinitions';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { modelTransformEvent } from '../../../../../../core/blitzkit/modelTransform';
import { Duel } from '../../../../../../stores/duel';

const modelDefinitions = await awaitableModelDefinitions;

export function InitialAligner() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);

  const tankModel = modelDefinitions.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];
  const gunModel = turretModel.guns[gun.gun_type!.value.base.id];

  useEffect(() => {
    const [pitch, yaw] = applyPitchYawLimits(
      degToRad(8),
      degToRad(25),
      gunModel.pitch,
      turretModel.yaw,
    );

    modelTransformEvent.dispatch({ pitch, yaw });
  }, []);

  return null;
}
