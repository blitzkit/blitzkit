import {
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
  type TankAttributeChange,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { times } from "lodash-es";

export type AggregatedAttributes = Partial<
  Record<TankAttributeChange_AttributeName, number>
>;

function patch(
  changes: TankAttributeChange[],
  attributes: AggregatedAttributes
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
  const attributes: AggregatedAttributes = {};

  patch(base, attributes);
  times(stage, (index) => patch(stages[index], attributes));

  return attributes;
}
