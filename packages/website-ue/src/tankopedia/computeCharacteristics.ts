import type { StageParameters } from "@protos/blitz_static_tank_upgrade_single_stage";
import {
  ShellUpgradeSingleChange_AttributeName,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import type { Tank } from "@protos/tank";
import { useEquipment } from "../hooks/useEquipment";
import { aggregateParameters } from "./aggregateParameters";
import {
  characteristics,
  type CharacteristicName,
  type CharacteristicOutput,
} from "./characteristics";
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

  const parameters = aggregateParameters(
    tank.tank!,
    state.upgrades,
    state.alternates,
    equipmentParameters,
  );

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

    if (!shell) {
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
