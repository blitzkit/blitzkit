import { StandardSinglePrice } from "@protos/blitz_static_standard_single_price";
import { PenetrationGroup } from "@protos/blitz_static_tank_penetration_group";
import {
  PenetrationGroupUpgrade,
  PitchLimit,
  ShellUpgrade,
  ShellUpgrageSingleChange,
  StageParameters,
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
  VisualChanges,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { times } from "lodash-es";

function patch(change: StageParameters, base: StageParameters) {
  if (change.stage_number !== ++base.stage_number) {
    throw new Error("Change stage number must be 1 greater than base");
  }

  for (const changedAttribute of change.attributes) {
    let newValue: number;

    switch (changedAttribute.modifier) {
      case TankAttributeChange_Modifier.MODIFIER_OVERRIDE:
        newValue = changedAttribute.value;
        break;

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY:
      case TankAttributeChange_Modifier.MODIFIER_ADD:
        if (!(changedAttribute.attribute_name in base)) {
          throw new Error(
            `Missing attribute ${
              TankAttributeChange_AttributeName[changedAttribute.attribute_name]
            } to modify`
          );
        }

        const oldValue =
          base.attributes[changedAttribute.attribute_name]!.value;

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY: {
        newValue = oldValue! * changedAttribute.value;
        break;
      }

      case TankAttributeChange_Modifier.MODIFIER_ADD: {
        newValue = oldValue! + changedAttribute.value;
        break;
      }

      default:
        throw new Error(
          `Unhandled modified ${
            TankAttributeChange_Modifier[changedAttribute.modifier]
          }`
        );
    }

    base.attributes[changedAttribute.attribute_name] = {
      modifier: TankAttributeChange_Modifier.MODIFIER_OVERRIDE,
      attribute_name: changedAttribute.attribute_name,
      value: newValue,
    };
  }

  for (const changedPenetrationGroupUpgrades of change.penetration_groups_upgrades) {
    if (changedPenetrationGroupUpgrades.primary_armor.length > 0) {
      throw new Error("Primary armor is not empty; implement this");
    }

    let basePenetrationGroupUpgrades = base.penetration_groups_upgrades.find(
      (group) => group.tank_part === changedPenetrationGroupUpgrades.tank_part
    );

    if (!basePenetrationGroupUpgrades) {
      basePenetrationGroupUpgrades = PenetrationGroupUpgrade.create({
        tank_part: changedPenetrationGroupUpgrades.tank_part,
      });

      base.penetration_groups_upgrades.push(basePenetrationGroupUpgrades);
    }

    for (const changedPenetrationGroup of changedPenetrationGroupUpgrades.penetration_groups) {
      const basePenetrationGroup =
        basePenetrationGroupUpgrades.penetration_groups.find(
          (baseGroup) =>
            baseGroup.group_name === changedPenetrationGroup.group_name
        );

      if (basePenetrationGroup) {
        if (
          basePenetrationGroup.common_data !==
          changedPenetrationGroup.common_data
        ) {
          throw new Error("Common data is not the same");
        }

        basePenetrationGroup.armor = changedPenetrationGroup.armor;
      } else {
        basePenetrationGroupUpgrades.penetration_groups.push(
          PenetrationGroup.create(changedPenetrationGroup)
        );
      }
    }
  }

  if (change.modules_upgrades.length > 0) {
    throw new Error("Modules upgrades not implemented");
  }

  for (const changedShellUpgrades of change.shells_upgrades) {
    let baseShellUpgrades = base.shells_upgrades.find(
      (baseShell) => baseShell.shell_id === changedShellUpgrades.shell_id
    );

    if (!baseShellUpgrades) {
      baseShellUpgrades = ShellUpgrade.create({
        shell_id: changedShellUpgrades.shell_id,
      });
    }

    baseShellUpgrades.shell_type = changedShellUpgrades.shell_type;

    for (const changedShellUpgrade of changedShellUpgrades.changes) {
      const baseShellUpgrade = baseShellUpgrades.changes.find(
        (baseShellUpgrade) =>
          baseShellUpgrade.attribute_name === changedShellUpgrade.attribute_name
      );

      if (baseShellUpgrade) {
        baseShellUpgrade.value = changedShellUpgrade.value;
      } else {
        baseShellUpgrades.changes.push(
          ShellUpgrageSingleChange.create(changedShellUpgrade)
        );
      }
    }

    baseShellUpgrades.silver_price =
      changedShellUpgrades.silver_price === undefined
        ? undefined
        : StandardSinglePrice.create(changedShellUpgrades.silver_price);
  }

  if (change.pump_reload_times.length > 0) {
    throw new Error("Pump reload times not implemented");
  }

  if (change.pitch_limits_up.length > 0 && base.pitch_limits_up.length > 0) {
    throw new Error("Pitch limits not implemented");
  }

  for (const changePitchLimitUp of change.pitch_limits_up) {
    base.pitch_limits_up.push(PitchLimit.create(changePitchLimitUp));
  }

  if (
    change.pitch_limits_down.length > 0 &&
    base.pitch_limits_down.length > 0
  ) {
    throw new Error("Pitch limits not implemented");
  }

  for (const changePitchLimitDown of change.pitch_limits_down) {
    base.pitch_limits_down.push(PitchLimit.create(changePitchLimitDown));
  }

  for (const changeVisualChange of change.visual_changes) {
    const baseVisualChange = base.visual_changes.find(
      (baseVisualChange) =>
        baseVisualChange.tank_part === changeVisualChange.tank_part
    );

    if (baseVisualChange) {
      baseVisualChange.name = changeVisualChange.name;
    } else {
      base.visual_changes.push(VisualChanges.create(changeVisualChange));
    }
  }
}

export function aggregateStages(
  base: StageParameters,
  stages: StageParameters[],
  stage: number
) {
  const attributes = StageParameters.create();

  patch(base, attributes);

  /**
   * Bug in Reforged: base stats are stage 1, so is the first upgrade. Manually
   * setting it to stage 0 below and if the bug's been fixed, throw an error
   * in dev mode to allow clean up in the future. Also, update the initial
   * stage number to -1.
   */

  if (attributes.stage_number === 0 && import.meta.env.DEV) {
    throw new Error(
      "Base stats are now stage 0. In-game bug fixed, please remove hack."
    );
  }

  attributes.stage_number = 0;

  times(stage, (index) => patch(stages[index], attributes));

  return attributes;
}
