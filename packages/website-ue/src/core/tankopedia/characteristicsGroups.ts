import type { CharacteristicName } from "./characteristics";

export enum BetterDirection {
  Higher,
  Lower,
}

type CharacteristicsOrder = {
  group: string;
  order: (
    | {
        name: CharacteristicName;
        decimals?: number;
      }
    | {
        toy: string;
      }
  )[];
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
      { name: "reload" },

      { toy: "reload" },

      { name: "caliber" },
      { name: "normalization" },
      { name: "ricochet" },

      { toy: "ricochet" },

      { name: "shell_velocity" },
      { name: "shell_range" },
      { name: "shell_capacity" },
      { name: "aim_time" },
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
