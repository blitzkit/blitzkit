import { api } from "../api/dynamic";
import { characteristics } from "../config/characteristics";
import { Tankopedia, type TankEnvironment } from "../stores/tankopedia";
import type { TankState } from "../tankopedia/tankState";
import type {
  CharacteristicContext,
  CharacteristicName,
  ComputedCharacteristics,
} from "../types/characteristics";
import type { DuelSide } from "./useEquipment";

const tanks = await api.tanks();

export function useCharacteristics(side: DuelSide) {
  const state = Tankopedia.use((state) => state[side]);
  const environment = Tankopedia.use((state) => state.environment);

  return computeCharacteristics(state, environment);
}

export function computeCharacteristics(
  state: TankState,
  environment: TankEnvironment,
) {
  const computed: ComputedCharacteristics = new Map();

  const tank = tanks.tanks[state.tank];
  const engine = tank.engines.find((engine) => engine.id === state.engine)!;
  const track = tank.tracks.find((track) => track.id === state.track)!;
  const turret = tank.turrets.find((turret) => turret.id === state.turret)!;
  const gun = turret.guns.find((gun) => gun.id === state.gun)!;
  const shell = gun.shells.find((shell) => shell.id === state.shell)!;

  function characteristic(name: CharacteristicName) {
    if (!computed.has(name)) {
      throw new Error(`Characteristic ${name} not computed yet`);
    }

    return computed.get(name)!;
  }

  const context = {
    state,
    environment,

    tank,
    engine,
    track,
    turret,
    gun,
    shell,

    characteristic,
  } satisfies CharacteristicContext;

  for (const name in characteristics) {
    const characteristic = characteristics[name as CharacteristicName];
    let shouldRender = true;

    if ("should_render" in characteristic) {
      shouldRender = characteristic.should_render(context);
    }

    if (!shouldRender) continue;

    const value = characteristic.compute(context);

    computed.set(name as CharacteristicName, value);
  }

  return computed;
}
