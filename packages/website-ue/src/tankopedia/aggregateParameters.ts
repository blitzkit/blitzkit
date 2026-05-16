import { StandardSinglePrice } from "@protos/blitz/blitz_static_standard_single_price";
import type { TankCatalogComponent } from "@protos/blitz/blitz_static_tank_component";
import { PenetrationGroup } from "@protos/blitz/blitz_static_tank_penetration_group";
import {
  ModuleUpgrade,
  ModuleUpgrade_Modifier,
  PenetrationGroupUpgrade,
  PitchLimit,
  ShellUpgrade,
  ShellUpgradeSingleChange,
  StageParameters,
  TankAttributeChange,
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
  VisualChanges,
} from "@protos/blitz/blitz_static_tank_upgrade_single_stage";
import {
  isAlternativeLine,
  originalLineName,
} from "../config/alternativeLines";

function patch(stage0: StageParameters, stage1: StageParameters) {
  if (stage1.number !== ++stage0.number) {
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
            attribute0.attribute_name === attribute1.attribute_name,
        );

        if (!attribute0) {
          throw new Error(
            `Missing attribute ${
              TankAttributeChange_AttributeName[attribute1.attribute_name]
            } (${attribute1.attribute_name}) to modify`,
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
          }`,
        );
    }

    const attribute0 = TankAttributeChange.create({
      modifier: TankAttributeChange_Modifier.MODIFIER_OVERRIDE,
      attribute_name: attribute1.attribute_name,
      value: value1,
    });
    const index0 = stage0.attributes.findIndex(
      (attribute) => attribute.attribute_name === attribute1.attribute_name,
    );

    if (index0 === -1) {
      stage0.attributes.push(attribute0);
    } else {
      stage0.attributes[index0] = attribute0;
    }
  }

  for (const penetrationGroupUpgrade1 of stage1.penetration_groups_upgrades) {
    const penetrationGroupUpgrade0 = stage0.penetration_groups_upgrades.find(
      (group) => group.tank_part === penetrationGroupUpgrade1.tank_part,
    );

    if (penetrationGroupUpgrade0) {
      penetrationGroupUpgrade0.primary_armor = [
        ...penetrationGroupUpgrade1.primary_armor,
      ];

      for (const penetrationGroup1 of penetrationGroupUpgrade1.penetration_groups) {
        const penetrationGroup0 =
          penetrationGroupUpgrade0.penetration_groups.find(
            (baseGroup) =>
              baseGroup.group_name === penetrationGroup1.group_name,
          );

        if (penetrationGroup0) {
          penetrationGroup0.common_data = penetrationGroup1.common_data;
          penetrationGroup0.armor = penetrationGroup1.armor;
        } else {
          penetrationGroupUpgrade0.penetration_groups.push(
            PenetrationGroup.create(penetrationGroup1),
          );
        }
      }
    } else {
      stage0.penetration_groups_upgrades.push(
        PenetrationGroupUpgrade.create(penetrationGroupUpgrade1),
      );
    }
  }

  for (const upgrade1 of stage1.modules_upgrades) {
    let value1: number;

    switch (upgrade1.modifier) {
      case ModuleUpgrade_Modifier.MODIFIER_OVERRIDE:
        value1 = upgrade1.value!;
        break;

      case ModuleUpgrade_Modifier.MODIFIER_MULTIPLY:
      case ModuleUpgrade_Modifier.MODIFIER_ADD:
        const upgrade0 = stage0.modules_upgrades.find(
          (base) =>
            base.module === upgrade1.module &&
            base.attribute_name === upgrade1.attribute_name,
        );

        if (!upgrade0) {
          throw new Error(
            `Missing module upgrade ${upgrade1.module} ${upgrade1.attribute_name} to modify`,
          );
        }

      case ModuleUpgrade_Modifier.MODIFIER_MULTIPLY: {
        value1 = upgrade0!.value! * upgrade1.value!;
        break;
      }

      case ModuleUpgrade_Modifier.MODIFIER_ADD: {
        value1 = upgrade0!.value! + upgrade1.value!;
        break;
      }

      default:
        throw new Error(
          `Unhandled module upgrade modifier ${
            ModuleUpgrade_Modifier[upgrade1.modifier]
          }`,
        );
    }

    const upgrade0 = ModuleUpgrade.create({
      module: upgrade1.module,
      attribute_name: upgrade1.attribute_name,
      modifier: ModuleUpgrade_Modifier.MODIFIER_OVERRIDE,
      value: value1,
    });
    const index0 = stage0.modules_upgrades.findIndex(
      (upgrade) =>
        upgrade.module === upgrade1.module &&
        upgrade.attribute_name === upgrade1.attribute_name,
    );

    if (index0 === -1) {
      stage0.modules_upgrades.push(upgrade0);
    } else {
      stage0.modules_upgrades[index0] = upgrade0;
    }
  }

  for (const shellUpgrades1 of stage1.shells_upgrades) {
    let shellUpgrades0 = stage0.shells_upgrades.find(
      (baseShell) => baseShell.shell_id === shellUpgrades1.shell_id,
    );

    if (shellUpgrades0) {
      shellUpgrades0.shell_type = shellUpgrades1.shell_type;

      for (const changedShellUpgrade of shellUpgrades1.changes) {
        const shellUpgrade0 = shellUpgrades0.changes.find(
          (baseShellUpgrade) =>
            baseShellUpgrade.attribute_name ===
            changedShellUpgrade.attribute_name,
        );

        if (shellUpgrade0) {
          shellUpgrade0.value = changedShellUpgrade.value;
        } else {
          shellUpgrades0.changes.push(
            ShellUpgradeSingleChange.create(changedShellUpgrade),
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

  if (stage1.pitch_limits_up.length > 0) {
    stage0.pitch_limits_up = [];

    for (const pitchLimitUp1 of stage1.pitch_limits_up) {
      stage0.pitch_limits_up.push(PitchLimit.create(pitchLimitUp1));
    }
  }

  if (stage1.pitch_limits_down.length > 0) {
    stage0.pitch_limits_down = [];

    for (const pitchLimitDown1 of stage1.pitch_limits_down) {
      stage0.pitch_limits_down.push(PitchLimit.create(pitchLimitDown1));
    }
  }

  for (const visualChange1 of stage1.visual_changes) {
    const visualChange0 = stage0.visual_changes.find(
      (baseVisualChange) =>
        baseVisualChange.tank_part === visualChange1.tank_part,
    );

    if (visualChange0) {
      visualChange0.name = visualChange1.name;
    } else {
      stage0.visual_changes.push(VisualChanges.create(visualChange1));
    }
  }
}

export function aggregateParameters(
  tank: TankCatalogComponent,
  upgrades: Record<string, number>,
  alternates: Record<string, boolean>,
) {
  const stage0 = StageParameters.create({});

  for (const line of tank.upgrade_lines) {
    let stage: number;

    if (isAlternativeLine(line.name)) {
      const originalLine = originalLineName(line.name)!;

      if (alternates[originalLine]) {
        stage = 0;
      } else {
        continue;
      }
    } else {
      if (alternates[line.name]) {
        stage = line.stages.length - 2;
      } else {
        stage = upgrades[line.name];
      }
    }

    stage0.number = 0;

    for (let i = 0; i <= stage; i++) {
      patch(stage0, line.stages[i]);
    }
  }

  return stage0;
}
