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
import { duelSides, type DuelSide } from "./useEquipment";

const tanks = await api.tanks();
const scripts = await api.scripts();
const equipment = await api.equipment();

export function useCharacteristics() {
  const protagonist = Tankopedia.use((state) => state.protagonist);
  const antagonist = Tankopedia.use((state) => state.antagonist);
  const environment = Tankopedia.use((state) => state.environment);

  return computeCharacteristics({ protagonist, antagonist }, environment);
}

export function computeCharacteristics(
  states: Record<DuelSide, TankState>,
  environment: TankEnvironment,
) {
  const computed: ComputedCharacteristics = new Map();

  const tank = tanks.tanks[states.protagonist.tank];
  const engine = tank.engines.find(
    (engine) => engine.id === states.protagonist.engine,
  )!;
  const track = tank.tracks.find(
    (track) => track.id === states.protagonist.track,
  )!;
  const turret = tank.turrets.find(
    (turret) => turret.id === states.protagonist.turret,
  )!;
  const gun = turret.guns.find((gun) => gun.id === states.protagonist.gun)!;
  const shell = gun.shells.find(
    (shell) => shell.id === states.protagonist.shell,
  )!;

  const equipmentPreset = equipment.presets[tank.equipment_preset];

  const scriptsMap: Record<DuelSide, Map<string, BlitzEffectScript>> = {
    protagonist: new Map(),
    antagonist: new Map(),
  };

  for (const side of duelSides) {
    for (const id of states[side].consumables) {
      if (!(id in scripts.consumables)) continue;

      const script = scripts.consumables[id];
      scriptsMap.protagonist.set(script["#text"], script);
    }

    for (const id of states[side].provisions) {
      if (!(id in scripts.provisions)) continue;

      const script = scripts.provisions[id];
      scriptsMap.protagonist.set(script["#text"], script);
    }

    for (const index in states[side].equipment) {
      const choice = states[side].equipment[index];
      const id = equipmentPreset.slots[index].options[choice];

      if (!(id in scripts.equipment)) continue;

      const script = scripts.equipment[id];
      scriptsMap.protagonist.set(script["#text"], script);
    }
  }

  function characteristic(name: CharacteristicName) {
    if (!computed.has(name)) {
      throw new Error(`Characteristic ${name} not computed yet`);
    }

    return computed.get(name)!;
  }

  // console.log(scriptsMap);

  function script(
    side: DuelSide,
    name: string,
    callback: (effect: BlitzEffectScript) => void,
  ) {
    if (!scriptsMap[side].has(name)) return;
    callback(scriptsMap[side].get(name)!);
  }

  const context = {
    state: states.protagonist,
    environment,

    equalizer: tank.equalizer ?? defaultEqualizer,

    progressive,
    degressive,

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
