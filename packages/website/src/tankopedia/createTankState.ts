import { createDefaultProvisions } from "@blitzkit/core";
import type { TankDefinition } from "@blitzkit/protos";
import { api } from "../api/dynamic";
import { createTankEquipment } from "./createTankEquipment";
import { createTankStatus } from "./createTankStatus";
import type { TankState } from "./tankState";

export type EquipmentMatrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

const models = await api.models();
const provisions = await api.provisions();
const scripts = await api.scripts();

export function createTankState(tank: TankDefinition) {
  const turret = tank.turrets.at(-1)!;
  const gun = turret.guns.at(-1)!;

  return {
    tank: tank.id,

    engine: tank.engines.at(-1)!.id,
    turret: turret.id,
    gun: gun.id,
    shell: gun.shells[0].id,
    track: tank.tracks.at(-1)!.id,

    speed: 0,

    equipment: createTankEquipment(),
    status: createTankStatus(),

    model: models.models[tank.id],

    consumables: [],
    provisions: createDefaultProvisions(tank, gun, provisions, scripts),
    camouflage: true,
    cooldown_booster: 0,
  } satisfies TankState;
}
