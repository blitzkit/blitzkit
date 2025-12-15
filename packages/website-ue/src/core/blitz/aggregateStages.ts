import {
  PenetrationGroupUpgrade,
  StageParameters,
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { times } from "lodash-es";

function patch(change: StageParameters, base: StageParameters) {
  if (change.stage_number !== ++base.stage_number) {
    throw new Error("Change stage number must be 1 greater than base");
  }

  for (const attribute of change.attributes) {
    let newValue: number;

    switch (attribute.modifier) {
      case TankAttributeChange_Modifier.MODIFIER_OVERRIDE:
        newValue = attribute.value;
        break;

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY:
      case TankAttributeChange_Modifier.MODIFIER_ADD:
        if (!(attribute.attribute_name in base)) {
          throw new Error(
            `Missing attribute ${
              TankAttributeChange_AttributeName[attribute.attribute_name]
            } to modify`
          );
        }

        const oldValue = base.attributes[attribute.attribute_name]!.value;

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY: {
        newValue = oldValue! * attribute.value;
        break;
      }

      case TankAttributeChange_Modifier.MODIFIER_ADD: {
        newValue = oldValue! + attribute.value;
        break;
      }

      default:
        throw new Error(
          `Unhandled modified ${
            TankAttributeChange_Modifier[attribute.modifier]
          }`
        );
    }

    base.attributes[attribute.attribute_name] = {
      modifier: TankAttributeChange_Modifier.MODIFIER_OVERRIDE,
      attribute_name: attribute.attribute_name,
      value: newValue,
    };
  }

  for (const changedPenetrationGroupsUpgrade of change.penetration_groups_upgrades) {
    if (changedPenetrationGroupsUpgrade.primary_armor.length > 0) {
      throw new Error("Primary armor is not empty; implement this");
    }

    let basePenetrationGroupsUpgrade = base.penetration_groups_upgrades.find(
      (group) => group.tank_part === changedPenetrationGroupsUpgrade.tank_part
    );

    if (!basePenetrationGroupsUpgrade) {
      basePenetrationGroupsUpgrade = PenetrationGroupUpgrade.create({
        tank_part: changedPenetrationGroupsUpgrade.tank_part,
      });

      base.penetration_groups_upgrades.push(basePenetrationGroupsUpgrade);
    }

    for (const changedGroup of changedPenetrationGroupsUpgrade.penetration_groups) {
      const baseGroup = basePenetrationGroupsUpgrade.penetration_groups.find(
        (baseGroup) => baseGroup.group_name === changedGroup.group_name
      );

      if (baseGroup) {
        if (baseGroup.common_data !== changedGroup.common_data) {
          throw new Error("Common data is not the same");
        }

        baseGroup.armor = changedGroup.armor;
      } else {
        basePenetrationGroupsUpgrade.penetration_groups.push({
          ...changedGroup,
        });
      }
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
