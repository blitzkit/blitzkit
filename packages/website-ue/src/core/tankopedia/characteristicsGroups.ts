import type { CharacteristicName } from "./characteristics";

type CharacteristicsOrder = {
  group: string;
  order: CharacteristicName[];
}[];

export const characteristicsGroups = [
  {
    group: "firepower",
    order: ["gun_type", "dpm"],
  },
  {
    group: "maneuverability",
    order: [],
  },
  {
    group: "survivability",
    order: [],
  },
  {
    group: "miscellaneous",
    order: [],
  },
] satisfies CharacteristicsOrder;
