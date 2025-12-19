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

export const characteristicsGroups: CharacteristicsOrder = [
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

      { name: "dispersion_still" },
      { name: "dispersion_moving" },
      { name: "dispersion_hull_traversing" },
      { name: "dispersion_turret_traversing" },
      { name: "dispersion_shooting" },
      { name: "dispersion_gun_damaged" },

      { name: "gun_depression" },
      { name: "gun_elevation" },

      { toy: "flexibility" },
    ],
  },
  {
    group: "maneuverability",
    order: [
      { name: "speed_forward" },
      { name: "speed_backward" },

      { name: "engine_power" },
      { name: "weight" },

      { name: "terrain_coefficient_hard" },
      { name: "terrain_coefficient_medium" },
      { name: "terrain_coefficient_soft" },

      { name: "power_to_weight_hard" },
      { name: "power_to_weight_medium" },
      { name: "power_to_weight_soft" },

      { name: "turret_traverse_speed" },
      { name: "hull_traverse_speed_hard" },
      { name: "hull_traverse_speed_medium" },
      { name: "hull_traverse_speed_soft" },

      { toy: "traverse" },
    ],
  },
  {
    group: "survivability",
    order: [
      { name: "health" },
      { name: "fire_chance" },
      { name: "view_range" },

      { toy: "view_range" },

      { name: "camouflage_still" },
      { name: "camouflage_moving" },
      { name: "camouflage_shooting_still" },
      { name: "camouflage_shooting_moving" },
      { name: "camouflage_on_fire" },

      { name: "height" },
      { name: "length" },
      { name: "volume" },
    ],
  },
  {
    group: "miscellaneous",
    order: [],
  },
];
