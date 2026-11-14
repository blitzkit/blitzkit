import { api } from "../api/dynamic";
import type { TankState } from "./tankState";

const tanks = await api.tanks();

// Turns the ids held in a tank state into their definitions
export function resolveTankModules(state: TankState) {
  // TODO: consider changing array to a map just like modules
  const tank = tanks.tanks[state.tank];
  const turret = tank.turrets.find(({ id }) => id === state.turret)!;
  const gun = turret.guns.find(({ id }) => id === state.gun)!;
  const shell = gun.shells.find(({ id }) => id === state.shell)!;
  const engine = tank.engines.find(({ id }) => id === state.engine)!;
  const track = tank.tracks.find(({ id }) => id === state.track)!;

  return { tank, turret, gun, shell, engine, track };
}
