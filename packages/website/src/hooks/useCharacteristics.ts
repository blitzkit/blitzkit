import type { BlitzEffectScript } from "@blitzkit/core/src/types/blitzEffectScript";
import { api } from "../api/dynamic";
import { characteristics } from "../config/characteristics";
import { defaultEqualizer } from "../config/equalizer";
import { Tankopedia, type TankEnvironment } from "../stores/tankopedia";
import type { TankState } from "../tankopedia/tankState";
import type {
  CharacteristicContext,
  CharacteristicName,
  ComputedCharacteristics,
} from "../types/characteristics";
import type { DuelSide } from "./useEquipment";

const tanks = await api.tanks();
const scripts = await api.scripts();
const equipment = await api.equipment();

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

  const equipmentPreset = equipment.presets[tank.equipment_preset];

  const scriptsMap = new Map<string, BlitzEffectScript>();

  for (const id of state.consumables) {
    if (!(id in scripts.consumables)) continue;

    const script = scripts.consumables[id];
    scriptsMap.set(script["#text"], script);
  }

  for (const index in state.equipment) {
    const choice = state.equipment[index];
    const id = equipmentPreset.slots[index].options[choice];

    if (!(id in scripts.equipment)) continue;

    const script = scripts.equipment[id];
    scriptsMap.set(script["#text"], script);
  }

  function characteristic(name: CharacteristicName) {
    if (!computed.has(name)) {
      throw new Error(`Characteristic ${name} not computed yet`);
    }

    return computed.get(name)!;
  }

  console.log(scriptsMap);

  function script(name: string, callback: (effect: BlitzEffectScript) => void) {
    if (!scriptsMap.has(name)) return;
    callback(scriptsMap.get(name)!);
  }

  const context = {
    state,
    environment,

    equalizer: tank.equalizer ?? defaultEqualizer,

    tank,
    engine,
    track,
    turret,
    gun,
    shell,

    characteristic,
    script,
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
