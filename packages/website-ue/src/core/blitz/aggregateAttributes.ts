import {
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
  type TankAttributeChange,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { times } from "lodash-es";

function patch(
  changes: TankAttributeChange[],
  attributes: Partial<Record<TankAttributeChange_AttributeName, number>>
) {
  for (const { attribute_name, value, modifier } of changes) {
    switch (modifier) {
      case TankAttributeChange_Modifier.MODIFIER_OVERRIDE:
        attributes[attribute_name] = value;
        break;

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY: {
        if (!(attribute_name in attributes)) {
          throw new Error(
            `Missing attribute ${TankAttributeChange_AttributeName[attribute_name]} to modify`
          );
        }
      }

      case TankAttributeChange_Modifier.MODIFIER_MULTIPLY: {
        attributes[attribute_name]! *= value;
        break;
      }

      default:
        throw new Error(
          `Unhandled modified ${TankAttributeChange_Modifier[modifier]}`
        );
    }
  }
}

export function aggregateAttributes(
  base: TankAttributeChange[],
  stages: TankAttributeChange[][],
  stage: number
) {
  const attributes: Partial<Record<TankAttributeChange_AttributeName, number>> =
    {};

  patch(base, attributes);
  times(stage, (index) => patch(stages[index], attributes));

  return attributes;
}
