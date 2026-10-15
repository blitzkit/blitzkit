import { characteristics } from "../config/characteristics";
import { characteristicsGroups } from "../config/characteristicsGroups";
import {
  CharacteristicType,
  type CharacteristicName,
} from "../types/characteristics";

const sortableCharacteristicTypes = new Set<CharacteristicType>([
  CharacteristicType.Number,
  CharacteristicType.NumberList,
]);

export const sortableCharacteristics = new Set<CharacteristicName>();

for (const group of characteristicsGroups) {
  for (const config of group.order) {
    if (!("name" in config)) continue;

    // TODO: remove this when all characteristics are defined
    if (!(config.name in characteristics)) continue;

    const item = characteristics[config.name];

    if (!sortableCharacteristicTypes.has(item.type)) continue;

    sortableCharacteristics.add(config.name);
  }
}
