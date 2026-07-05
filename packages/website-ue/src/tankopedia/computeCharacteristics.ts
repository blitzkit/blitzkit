import {
  ShellUpgradeSingleChange_AttributeName,
  StageParameters,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import type { Tank } from "@protos/tank";
import { isAlternativeLine, originalLineName } from "../config/modules";
import { useEquipment } from "../hooks/useEquipment";
import { aggregateParameters } from "./aggregateParameters";
import {
  characteristics,
  type CharacteristicName,
  type CharacteristicOutput,
} from "../config/characteristics";
import type { TankState } from "./tankState";

export type ComputedCharacteristics = Record<
  CharacteristicName,
  CharacteristicOutput
>;

export function computeCharacteristics(
  tank: Tank,
  equipment: ReturnType<typeof useEquipment>,
  state: TankState,
) {
  const equipmentParameters: StageParameters[] = [];

  for (const key in state.equipment) {
    const index = Number(key);
    const choice = state.equipment[index];
    const name = equipment.preset.slots[index].options_catalog_i_ds[choice];
    const data = equipment.equipments[name];

    equipmentParameters.push(data.upgrade_level!);
  }

  const parameters = StageParameters.create();

  for (const line of tank.tank!.upgrade_lines) {
    let stage: number;

    if (isAlternativeLine(line.name)) {
      const originalLine = originalLineName(line.name)!;

      if (state.alternates[originalLine]) {
        stage = 0;
      } else {
        continue;
      }
    } else {
      if (state.alternates[line.name]) {
        stage = line.stages.length - 2;
      } else {
        stage = state.upgrades[line.name];
      }
    }

    parameters.number = 0;

    for (let i = 0; i <= stage; i++) {
      aggregateParameters(parameters, line.stages[i]);
    }
  }

  for (const equipmentParameter of equipmentParameters) {
    parameters.number = -1;
    aggregateParameters(parameters, equipmentParameter);
  }

  const computed: Partial<ComputedCharacteristics> = {};

  function characteristic(name: CharacteristicName) {
    if (name in computed) return computed[name] as CharacteristicOutput;
    throw new Error(`${name} not computed yet`);
  }

  function attributeSafe(name: TankAttributeChange_AttributeName) {
    const attribute = parameters.attributes.find(
      (attribute) => attribute.attribute_name === name,
    );

    return attribute ? attribute.value : null;
  }

  function attribute(name: TankAttributeChange_AttributeName) {
    const attribute = attributeSafe(name);

    if (attribute === null) {
      throw new Error(
        `Attribute ${TankAttributeChange_AttributeName[name]} (${name}) not found`,
      );
    }

    return attribute;
  }

  function shellSafe(name: ShellUpgradeSingleChange_AttributeName) {
    const shell = parameters.shells_upgrades.find(
      (shell) => shell.shell_id === state.shell,
    );

    if (shell === undefined) {
      throw new Error(
        `Shell ${ShellUpgradeSingleChange_AttributeName[name]} (${name}) not found`,
      );
    }

    const attribute = shell.changes.find(
      (change) => change.attribute_name === name,
    );

    return attribute ? attribute.value : null;
  }

  function shell(name: ShellUpgradeSingleChange_AttributeName) {
    const attribute = shellSafe(name);

    if (attribute === null) {
      throw new Error(
        `Shell attribute ${ShellUpgradeSingleChange_AttributeName[name]} (${name}) not found`,
      );
    }

    return attribute;
  }

  for (const _name in characteristics) {
    const name = _name as CharacteristicName;
    const value = characteristics[name]({
      characteristic,
      attribute,
      attributeSafe,
      shell,
      shellSafe,
      state,
      tank,
      parameters,
    });
    computed[name] = value;
  }

  return {
    characteristics: computed as ComputedCharacteristics,
    parameters,
  };
}
