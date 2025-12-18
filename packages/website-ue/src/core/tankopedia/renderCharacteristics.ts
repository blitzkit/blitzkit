import type {
  ShellUpgrageSingleChange_AttributeName,
  StageParameters,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import {
  characteristics,
  type CharacteristicName,
  type CharacteristicOutput,
} from "./characteristics";

export function renderCharacteristics(
  parameters: StageParameters,
  shellId: number
) {
  const computed: Partial<Record<CharacteristicName, CharacteristicOutput>> =
    {};

  function characteristic(name: CharacteristicName) {
    if (name in computed) return computed[name] as CharacteristicOutput;
    throw new Error(`${name} not computed yet`);
  }

  function attribute(name: TankAttributeChange_AttributeName) {
    const attribute = parameters.attributes.find(
      (attribute) => attribute.attribute_name === name
    );

    if (!attribute) throw new Error(`Attribute ${name} not found`);
    ("");

    return attribute.value;
  }

  function shell(name: ShellUpgrageSingleChange_AttributeName) {
    const shell = parameters.shells_upgrades.find(
      (shell) => shell.shell_id === name
    );

    if (!shell) throw new Error(`Shell ${name} not found`);

    const attribute = shell.changes.find(
      (change) => change.attribute_name === name
    );

    if (!attribute) throw new Error(`Shell attribute ${name} not found`);

    return attribute.value;
  }

  for (const _name in characteristics) {
    const name = _name as CharacteristicName;
    const _characteristic = characteristics[name];
    const value = _characteristic.value({ characteristic, attribute, shell });
  }
}
