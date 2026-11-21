import { characteristics } from "../config/characteristics";
import { characteristicsGroups } from "../config/characteristicsGroups";
import {
  CharacteristicType,
  type RenderedCharacteristicName,
} from "../types/characteristics";

const sortableCharacteristicTypes = new Set<CharacteristicType>([
  CharacteristicType.Number,
  CharacteristicType.NumberList,
  CharacteristicType.Interval,
]);

export const sortableCharacteristics = new Set<RenderedCharacteristicName>();

for (const group of characteristicsGroups) {
  // Only groups that are explicitly unsortable are left out, which is different from undefined
  // yes, it's meant to be === false and not !sortable
  if (group.sortable === false) continue;

  for (const config of group.order) {
    if (!("name" in config)) continue;

    // TODO: remove this when all characteristics are defined
    if (!(config.name in characteristics)) continue;

    const item = characteristics[config.name];

    if (!sortableCharacteristicTypes.has(item.type)) continue;

    sortableCharacteristics.add(config.name);
  }
}
