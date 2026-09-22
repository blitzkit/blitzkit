import { createDefaultProvisions, type TankDefinition } from "@blitzkit/core";
import { api } from "../blitzkit/api";
import type { EquipmentMatrix } from "../stores/duel";
import type { TankState } from "../stores/tankopedia";

const models = await api.models();
const provisions = await api.provisions();
const scripts = await api.scripts();

export const genericDefaultEquipmentMatrix: EquipmentMatrix = [
  [-1, 1, -1],
  [0, 0, 0],
  [0, 0, 0],
];

export function createTankState(tank: TankDefinition) {
  const turret = tank.turrets.at(-1)!;
  const gun = turret.guns.at(-1)!;

  return {
    tank,
    model: models.models[turret.id],

    engine: tank.engines.at(-1)!,
    turret,
    gun,
    shell: gun.shells[0],
    track: tank.tracks.at(-1)!,

    equipment_matrix: genericDefaultEquipmentMatrix,

    consumables: [],
    provisions: createDefaultProvisions(tank, gun, provisions, scripts),
    camouflage: true,
    cooldown_booster: 0,
    assault_distance: (gun.assault_ranges?.ranges[0].distance ?? 0) / 2,
  } satisfies TankState;
}
