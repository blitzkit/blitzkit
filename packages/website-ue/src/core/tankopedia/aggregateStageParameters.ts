import { StandardSinglePrice } from "@protos/blitz_static_standard_single_price";
import { PenetrationGroup } from "@protos/blitz_static_tank_penetration_group";
import {
  PenetrationGroupUpgrade,
  PitchLimit,
  ShellUpgrade,
  ShellUpgrageSingleChange,
  StageParameters,
  TankAttributeChange,
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
  VisualChanges,
} from "@protos/blitz_static_tank_upgrade_single_stage";

function patch(stage0: StageParameters, stage1: StageParameters) {
  if (stage1.stage_number !== ++stage0.stage_number) {
    throw new Error("Change stage number must be 1 greater than base");
  }

  for (const attribute1 of stage1.attributes) {
    let value1: number;

    switch (attribute1.modifier) {
      case TankAttributeChange_Modifier.MODIFIER_OVERRIDE:
        value1 = attribute1.value;
        break;

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY:
      case TankAttributeChange_Modifier.MODIFIER_ADD:
        const attribute0 = stage0.attributes.find(
          (attribute0) =>
            attribute0.attribute_name === attribute1.attribute_name
        );

        if (!attribute0) {
          throw new Error(
            `Missing attribute ${
              TankAttributeChange_AttributeName[attribute1.attribute_name]
            } (${attribute1.attribute_name}) to modify`
          );
        }

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY: {
        value1 = attribute0!.value! * attribute1.value;
        break;
      }

      case TankAttributeChange_Modifier.MODIFIER_ADD: {
        value1 = attribute0!.value! + attribute1.value;
        break;
      }

      default:
        throw new Error(
          `Unhandled modified ${
            TankAttributeChange_Modifier[attribute1.modifier]
          }`
        );
    }

    const attribute0 = TankAttributeChange.create({
      modifier: TankAttributeChange_Modifier.MODIFIER_OVERRIDE,
      attribute_name: attribute1.attribute_name,
      value: value1,
    });
    const index0 = stage0.attributes.findIndex(
      (attribute) => attribute.attribute_name === attribute1.attribute_name
    );

    if (index0 === -1) {
      stage0.attributes.push(attribute0);
    } else {
      stage0.attributes[index0] = attribute0;
    }
  }

  for (const penetrationGroupUpgrade1 of stage1.penetration_groups_upgrades) {
    const penetrationGroupUpgrade0 = stage0.penetration_groups_upgrades.find(
      (group) => group.tank_part === penetrationGroupUpgrade1.tank_part
    );

    if (penetrationGroupUpgrade0) {
      penetrationGroupUpgrade0.primary_armor = [
        ...penetrationGroupUpgrade1.primary_armor,
      ];

      for (const penetrationGroup1 of penetrationGroupUpgrade1.penetration_groups) {
        const penetrationGroup0 =
          penetrationGroupUpgrade0.penetration_groups.find(
            (baseGroup) => baseGroup.group_name === penetrationGroup1.group_name
          );

        if (penetrationGroup0) {
          penetrationGroup0.common_data = penetrationGroup1.common_data;
          penetrationGroup0.armor = penetrationGroup1.armor;
        } else {
          penetrationGroupUpgrade0.penetration_groups.push(
            PenetrationGroup.create(penetrationGroup1)
          );
        }
      }
    } else {
      stage0.penetration_groups_upgrades.push(
        PenetrationGroupUpgrade.create(penetrationGroupUpgrade1)
      );
    }
  }

  if (stage1.modules_upgrades.length > 0) {
    throw new Error("Modules upgrades not implemented");
  }

  for (const shellUpgrades1 of stage1.shells_upgrades) {
    let shellUpgrades0 = stage0.shells_upgrades.find(
      (baseShell) => baseShell.shell_id === shellUpgrades1.shell_id
    );

    if (shellUpgrades0) {
      shellUpgrades0.shell_type = shellUpgrades1.shell_type;

      for (const changedShellUpgrade of shellUpgrades1.changes) {
        const shellUpgrade0 = shellUpgrades0.changes.find(
          (baseShellUpgrade) =>
            baseShellUpgrade.attribute_name ===
            changedShellUpgrade.attribute_name
        );

        if (shellUpgrade0) {
          shellUpgrade0.value = changedShellUpgrade.value;
        } else {
          shellUpgrades0.changes.push(
            ShellUpgrageSingleChange.create(changedShellUpgrade)
          );
        }
      }

      shellUpgrades0.silver_price =
        shellUpgrades1.silver_price === undefined
          ? undefined
          : StandardSinglePrice.create(shellUpgrades1.silver_price);
    } else {
      stage0.shells_upgrades.push(ShellUpgrade.create(shellUpgrades1));
    }
  }

  if (stage1.pump_reload_times.length > 0) {
    stage0.pump_reload_times = [...stage1.pump_reload_times];
  }

  if (stage1.pitch_limits_up.length > 0 && stage0.pitch_limits_up.length > 0) {
    throw new Error("Pitch limits not implemented");
  }

  for (const pitchLimitUp1 of stage1.pitch_limits_up) {
    stage0.pitch_limits_up.push(PitchLimit.create(pitchLimitUp1));
  }

  if (
    stage1.pitch_limits_down.length > 0 &&
    stage0.pitch_limits_down.length > 0
  ) {
    throw new Error("Pitch limits not implemented");
  }

  for (const pitchLimitDown1 of stage1.pitch_limits_down) {
    stage0.pitch_limits_down.push(PitchLimit.create(pitchLimitDown1));
  }

  for (const visualChange1 of stage1.visual_changes) {
    const visualChange0 = stage0.visual_changes.find(
      (baseVisualChange) =>
        baseVisualChange.tank_part === visualChange1.tank_part
    );

    if (visualChange0) {
      visualChange0.name = visualChange1.name;
    } else {
      stage0.visual_changes.push(VisualChanges.create(visualChange1));
    }
  }
}

export function aggregateStageParameters(
  base: StageParameters,
  stages: StageParameters[]
) {
  const stage0 = StageParameters.create({ ...base, stage_number: 0 });

  /**
   * Bug in Reforged: base stats are stage 1, so is the first upgrade. Manually
   * setting it to stage 0 below and if the bug's been fixed, throw an error
   * in dev mode to allow clean up in the future. Also, update the initial
   * stage number to -1.
   */

  if (base.stage_number === 0 && import.meta.env.DEV) {
    throw new Error(
      "Base stats are now stage 0. In-game bug fixed, please remove hack."
    );
  }

  stages.forEach((stage) => patch(stage0, stage));

  return stage0;
}
