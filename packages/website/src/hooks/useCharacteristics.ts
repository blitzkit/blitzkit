import {
  createDefaultEnvironment,
  degressiveStat,
  progressiveStat,
  type TankEnvironment,
} from "@blitzkit/core";
import type { BlitzEffectScript } from "@blitzkit/core/src/types/blitzEffectScript";
import {
  AbilitySource,
  CrewType,
  type GunDefinition,
  type TankDefinition,
} from "@blitzkit/protos";
import { useMemo } from "react";
import { api } from "../api/dynamic";
import { characteristics } from "../config/characteristics";
import { defaultEqualizer } from "../config/equalizer";
import { Tankopedia } from "../stores/tankopedia";
import { augmentAttributes } from "../tankopedia/augments";
import { createTankState } from "../tankopedia/createTankState";
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
const skills = await api.skills();

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

  const scriptsMap: Record<DuelSide, Map<string, BlitzEffectScript[]>> = {
    protagonist: new Map(),
    antagonist: new Map(),
  };
  const scriptGunMap: Record<DuelSide, Map<string, GunDefinition>> = {
    protagonist: new Map(),
    antagonist: new Map(),
  };

  function addScript(side: DuelSide, name: string, script: BlitzEffectScript) {
    if (!scriptsMap[side].has(name)) {
      scriptsMap[side].set(name, []);
    }

    scriptsMap[side].get(name)!.push(script);
  }

  for (const side of duelSides) {
    const sideTank = tanks.tanks[states[side].tank];
    const sideEquipmentPreset = equipment.presets[sideTank.equipment_preset];

    for (const id of states[side].consumables) {
      if (!(id in scripts.consumables)) continue;

      const script = scripts.consumables[id];

      addScript(side, script["#text"], script);
    }

    for (const id of states[side].provisions) {
      if (!(id in scripts.provisions)) continue;

      const script = scripts.provisions[id];

      addScript(side, script["#text"], script);
    }

    // A tank's vehicle abilities are hidden provisions or consumables, which
    // count like any other script
    for (const ability of sideTank.vehicle_abilities) {
      const script =
        scripts[
          ability.source === AbilitySource.ABILITY_SOURCE_PROVISION
            ? "provisions"
            : "consumables"
        ][ability.id];

      if (script === undefined) continue;

      addScript(side, script["#text"], script);

      if (ability.gun !== undefined) {
        scriptGunMap[side].set(script["#text"], ability.gun);
      }
    }

    for (const index in states[side].equipment) {
      const choice = states[side].equipment[index];
      const id = sideEquipmentPreset.slots[index].options[choice];

      if (!(id in scripts.equipment)) continue;

      const script = scripts.equipment[id];

      addScript(side, script["#text"], script);
    }
  }

  let provisionCrewBonus = 0;
  script("protagonist", "Stimulator", (effect) => {
    provisionCrewBonus += (effect.bonusValues?.crewLevelIncrease ?? 0) / 100;
  });

  script("protagonist", "StaticAdditiveDevice", (effect) => {
    if (effect.attribute !== "miscAttrs/crewLevelIncrease") return;

    provisionCrewBonus += (effect.bonusValues?.value ?? 0) / 100;
  });

  const commanderMastery = 1 + provisionCrewBonus;
  const crewMastery = {
    commander: commanderMastery,
    loader:
      commanderMastery *
      (tank.crew.some(({ type }) => type === CrewType.CREW_TYPE_LOADER)
        ? 1.1
        : 1.05),
    gunner:
      commanderMastery *
      (tank.crew.some(({ type }) => type === CrewType.CREW_TYPE_GUNNER)
        ? 1.1
        : 1.05),
    driver:
      commanderMastery *
      (tank.crew.some(({ type }) => type === CrewType.CREW_TYPE_DRIVER)
        ? 1.1
        : 1.05),
  };

  function progressive(role: keyof typeof crewMastery) {
    return progressiveStat(crewMastery[role]);
  }
  function degressive(role: keyof typeof crewMastery) {
    return degressiveStat(crewMastery[role]);
  }

  function characteristic(name: CharacteristicName) {
    if (!computed.has(name)) {
      throw new Error(`Characteristic ${name} not computed yet`);
    }

    return computed.get(name)!;
  }

  // console.log(scriptsMap);

  // The gun is the script's placeholder gun when it is a vehicle ability with one
  function script(
    side: DuelSide,
    name: string,
    callback: (effect: BlitzEffectScript, gun?: GunDefinition) => void,
  ) {
    if (!scriptsMap[side].has(name)) return;

    const scripts = scriptsMap[side].get(name)!;
    const gun = scriptGunMap[side].get(name);

    for (const script of scripts) {
      callback(script, gun);
    }
  }

  function hasScript(name: string) {
    return scriptsMap.protagonist.has(name);
  }

  const augments = augmentAttributes(tank, states.protagonist);

  function augment(name: string, callback: (value: number) => void) {
    if (!augments.has(name)) return;
    for (const value of augments.get(name)!) callback(value);
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
    hasScript,
    augment,
  } satisfies CharacteristicContext;

  for (const name in characteristics) {
    const characteristic = characteristics[name as CharacteristicName];
    let shouldRender = true;

    if ("should_render" in characteristic) {
      shouldRender = characteristic.should_render(context);
    }

    if (!shouldRender) continue;
    if (!("compute" in characteristic)) continue;

    const value = characteristic.compute(context);

    computed.set(name as CharacteristicName, value);
  }

  return computed;
}

export function useCharacteristics(side: DuelSide) {
  const A = Tankopedia.use((state) => state[side]);
  const B = Tankopedia.use(
    (state) => state[side === "antagonist" ? "protagonist" : "antagonist"],
  );
  const environment = Tankopedia.use((state) => state.environment);

  // A stable map, so what reads it only recomputes when the loadout changes
  return useMemo(
    () =>
      computeCharacteristics({ protagonist: A, antagonist: B }, environment),
    [A, B, environment],
  );
}

export function computeDefaultCharacteristics(tank: TankDefinition) {
  const state = createTankState(tank);

  return computeCharacteristics(
    { protagonist: state, antagonist: state },
    createDefaultEnvironment(skills),
  );
}
