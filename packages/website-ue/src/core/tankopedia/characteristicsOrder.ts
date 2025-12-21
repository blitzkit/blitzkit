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
        units?: string;
      }
    | {
        toy: string;
      }
  )[];
}[];

export const characteristicsOrder: CharacteristicsOrder = [
  {
    group: "firepower",
    order: [
      { name: "gun_type" },
      { name: "dpm", decimals: 0, units: "hp_min" },
      { name: "damage", units: "hp" },
      { name: "module_damage", units: "hp" },
      { name: "penetration", units: "mm" },
      { name: "clip_size" },
      { name: "reload", decimals: 2, units: "s" },
      { name: "intra_clip", decimals: 2, units: "s" },

      { toy: "reload" },

      { name: "caliber", units: "mm" },
      { name: "normalization", units: "deg" },
      { name: "ricochet", units: "deg" },

      { toy: "ricochet" },

      { name: "shell_velocity", units: "m_s" },
      { name: "shell_range", units: "m" },
      { name: "shell_capacity" },

      { name: "aim_time", decimals: 1, units: "s" },

      { toy: "aim_time" },

      { name: "dispersion", decimals: 3, units: "m" },

      { name: "gun_depression", decimals: 0, units: "deg" },
      { name: "gun_elevation", decimals: 0, units: "deg" },

      { toy: "flexibility" },
    ],
  },
  {
    group: "maneuverability",
    order: [
      { name: "speed_forward", units: "km_h" },
      { name: "speed_backward", units: "km_h" },

      { name: "engine_power", units: "bhp" },
      { name: "weight", units: "t" },

      { name: "terrain_coefficient_hard" },
      { name: "terrain_coefficient_medium" },
      { name: "terrain_coefficient_soft" },

      { name: "power_to_weight_hard", units: "bhp_t" },
      { name: "power_to_weight_medium", units: "bhp_t" },
      { name: "power_to_weight_soft", units: "bhp_t" },

      { name: "turret_traverse_speed", units: "deg_s" },
      { name: "hull_traverse_speed_hard", units: "deg_s" },
      { name: "hull_traverse_speed_medium", units: "deg_s" },
      { name: "hull_traverse_speed_soft", units: "deg_s" },

      { toy: "traverse" },
    ],
  },
  {
    group: "survivability",
    order: [
      { name: "health", units: "hp" },
      { name: "fire_chance", units: "%" },
      { name: "view_range", units: "m" },

      { toy: "view_range" },

      { name: "camouflage_still", units: "%" },
      { name: "camouflage_moving", units: "%" },
      { name: "camouflage_shooting_still", units: "%" },
      { name: "camouflage_shooting_moving", units: "%" },
      { name: "camouflage_on_fire", units: "%" },

      { name: "height", units: "m" },
      { name: "length", units: "m" },
      { name: "volume", units: "m" },
    ],
  },
];
