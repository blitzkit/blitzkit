import { api } from "../api/dynamic";
import type { TankState } from "./tankState";

const models = await api.models();

// Turns the ids held in a tank state into their model definitions
export function resolveTankModels(state: TankState) {
  const tank = models.models[state.tank];
  const turret = tank.turrets[state.turret];
  const gun = turret.guns[state.gun];
  const track = tank.tracks[state.track];

  return { tank, turret, gun, track };
}
