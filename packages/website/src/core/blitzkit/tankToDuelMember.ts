import {
  createDefaultProvisions,
  Equalizer,
  type ProvisionDefinitions,
  type TankDefinition,
} from "@blitzkit/core";
import type { DuelMember } from "../../stores/duel";
import { genericDefaultEquipmentMatrix } from "../../stores/duel/constants";

export function defaultTankWeapon(tank: TankDefinition) {
  for (const turret of [...tank.turrets].reverse()) {
    for (const gun of [...turret.guns].reverse()) {
      const shell = gun.shells[0];

      if (shell) return { turret, gun, shell };
    }
  }

  throw new Error(`Tank ${tank.id} has no gun with shells`);
}

export function tankToDuelMember(
  tank: TankDefinition,
  provisionDefinitions: ProvisionDefinitions,
) {
  const { turret, gun, shell } = defaultTankWeapon(tank);

  return {
    camouflage: true,
    consumables: [],
    equipmentMatrix: genericDefaultEquipmentMatrix,
    cooldownBooster: 0,
    provisions: createDefaultProvisions(tank, gun, provisionDefinitions),
    engine: tank.engines.at(-1)!,
    gun,
    shell,
    tank,
    track: tank.tracks.at(-1)!,
    turret,
    assaultDistance: (gun.assault_ranges?.ranges[0].distance ?? 0) / 2,
  } satisfies DuelMember;
}

export const defaultEqualizer: Equalizer = {
  armor: 1,
  damage: 1,
  health: 1,
  module_health: 1,
  penetration: 1,
};
