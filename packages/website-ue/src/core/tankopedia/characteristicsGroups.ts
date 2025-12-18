import type { CharacteristicName } from "./characteristics";

export enum BetterDirection {
  Higher,
  Lower,
}

type CharacteristicsOrder = {
  group: string;
  order: {
    name: CharacteristicName;
    decimals?: number;
  }[];
}[];

export const characteristicsGroups = [
  {
    group: "firepower",
    order: [
      { name: "gun_type" },
      { name: "dpm", decimals: 0 },
      { name: "damage" },
      { name: "module_damage" },
      { name: "penetration" },
    ],
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
