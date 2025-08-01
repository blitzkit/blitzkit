import {
  createDefaultProvisions,
  ModelDefinition,
  type ProvisionDefinitions,
  type TankDefinition,
} from '@blitzkit/core';
import { degToRad } from 'three/src/math/MathUtils.js';
import type { DuelMember } from '../../stores/duel';
import { genericDefaultEquipmentMatrix } from '../../stores/duel/constants';
import { applyPitchYawLimits } from '../blitz/applyPitchYawLimits';

export function tankToDuelMember(
  tank: TankDefinition,
  model: ModelDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  const turret = tank.turrets.at(-1)!;
  const turretModel = model.turrets[turret.id];
  const gun = turret.guns.at(-1)!;
  const gunModel = turretModel.guns[gun.gun_type!.value.base.id];

  const [pitch, yaw] = applyPitchYawLimits(
    degToRad(8),
    degToRad(25),
    gunModel.pitch,
    turretModel.yaw,
  );

  return {
    camouflage: true,
    consumables: [],
    equipmentMatrix: genericDefaultEquipmentMatrix,
    cooldownBooster: 0,
    provisions: createDefaultProvisions(tank, gun, provisionDefinitions),
    engine: tank.engines.at(-1)!,
    gun,
    shell: tank.turrets.at(-1)!.guns.at(-1)!.gun_type!.value.base.shells[0],
    tank,
    track: tank.tracks.at(-1)!,
    yaw,
    pitch,
    turret,
    assaultDistance: 0,
  } satisfies DuelMember;
}
