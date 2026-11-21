import type { TankState } from "./tankState";

export function createTankStatus() {
  const status = {
    commander_dead: false,
    gunner_dead: false,
    driver_dead: false,
    loader_dead: false,

    fuel_tank_damaged: false,
    engine_damaged: false,
    chassis_damaged: false,
    viewport_damaged: false,
    ammo_bay_damaged: false,
    gun_damaged: false,
    turret_damaged: false,

    caught_on_fire: false,
    shooting: false,
    turret_traversing: false,
    hull_traversing: false,
  } satisfies TankState["status"];

  return status;
}
