import {
  ShellUpgrageSingleChange_AttributeName,
  TankAttributeChange_AttributeName,
  type StageParameters,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import {
  characteristics,
  type CharacteristicName,
  type CharacteristicOutput,
} from "./characteristics";
import type { TankState } from "./tankState";

export function computeCharacteristics(
  parameters: StageParameters,
  state: TankState
) {
  const computed: Partial<Record<CharacteristicName, CharacteristicOutput>> =
    {};

  function characteristic(name: CharacteristicName) {
    if (name in computed) return computed[name] as CharacteristicOutput;
    throw new Error(`${name} not computed yet`);
  }

  function attributeSafe(name: TankAttributeChange_AttributeName) {
    const attribute = parameters.attributes.find(
      (attribute) => attribute.attribute_name === name
    );

    return attribute ? attribute.value : null;
  }

  function attribute(name: TankAttributeChange_AttributeName) {
    const attribute = attributeSafe(name);

    if (attribute === null) {
      throw new Error(
        `Attribute ${TankAttributeChange_AttributeName[name]} (${name}) not found`
      );
    }

    return attribute;
  }

  function shellSafe(name: ShellUpgrageSingleChange_AttributeName) {
    const shell = parameters.shells_upgrades.find(
      (shell) => shell.shell_id === state.shell
    );

    if (!shell) {
      throw new Error(
        `Shell ${ShellUpgrageSingleChange_AttributeName[name]} (${name}) not found`
      );
    }

    const attribute = shell.changes.find(
      (change) => change.attribute_name === name
    );

    return attribute ? attribute.value : null;
  }

  function shell(name: ShellUpgrageSingleChange_AttributeName) {
    const attribute = shellSafe(name);

    if (attribute === null) {
      throw new Error(
        `Shell attribute ${ShellUpgrageSingleChange_AttributeName[name]} (${name}) not found`
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
    });
    computed[name] = value;
  }

  return computed as Record<CharacteristicName, CharacteristicOutput>;
}
