import type { Strings } from "@blitzkit/i18n";
import {
  Nation,
  TankClass,
  TankType,
} from "@protos/blitz_static_tank_component";
import type { ReactNode } from "react";
import { VintageIcon } from "../icons/Vintage";
import {
  GunType,
  type CharacteristicName,
  type CharacteristicOutput,
} from "./characteristics";

export enum BetterDirection {
  Higher,
  Lower,
}

export interface CharacteristicRenderConfig {
  name: CharacteristicName;
  decimals?: number;
  units?: string;
  strings?: string;
  render?: (data: {
    output: CharacteristicOutput;
    strings: Strings;
    gameStrings: Record<string, string>;
  }) => ReactNode;
}

export type CharacteristicsGroup = {
  group: string;
  order: (
    | CharacteristicRenderConfig
    | {
        toy: string;
      }
  )[];
};

export const characteristicsOrder: CharacteristicsGroup[] = [
  {
    group: "meta",
    order: [
      {
        name: "name",
        strings: "TankEntity",
        render({ output, gameStrings }) {
          return gameStrings[output as string];
        },
      },
      {
        name: "class",
        render({ output, strings }) {
          return strings.classes.full[output as TankClass];
        },
      },
      {
        name: "type",
        render({ output, strings }) {
          return strings.types[output as TankType];
        },
      },
      {
        name: "nation",
        render({ output, strings }) {
          return strings.nations[output as Nation];
        },
      },
      {
        name: "tier",
        render({ output, strings }) {
          const name = output as string;

          if (name == "vintage") {
            return <VintageIcon />;
          }

          return strings.tiers[name as keyof typeof strings.tiers];
        },
      },
      { name: "compensation" },
      { name: "id" },
      { name: "slug" },
    ],
  },
  {
    group: "firepower",
    order: [
      { toy: "reload" },
      {
        name: "gun_type",
        render({ output }) {
          return GunType[output as GunType];
        },
      },
      { name: "dpm", decimals: 0, units: "hp_min" },
      { name: "reload", decimals: 2, units: "s" },
      { name: "reloads", decimals: 2, units: "s" },

      { name: "damage", units: "hp" },
      { name: "module_damage", units: "hp" },
      { name: "clip_size" },
      { name: "intra_clip", decimals: 2, units: "s" },
      // { name: "burst_size" }, // TODO: implement burst size
      // { name: 'intra_burst', decimals: 2, units: "s" }, // TODO: implement intra burst
      // TODO: investigate ATTRIBUTE_NAME_SHELLS_SLOTS
      // TODO: investigate ATTRIBUTE_NAME_RELOAD_SPEED_SCALE
      // TODO: investigate ATTRIBUTE_NAME_AVERAGE_THICKNESS

      // { toy: "ricochet" },
      { name: "penetration", units: "mm" },
      { name: "caliber", units: "mm" },
      { name: "normalization", units: "deg" },
      { name: "ricochet", units: "deg" },

      { name: "shell_velocity", units: "m_s" },
      { name: "shell_range", units: "m" },
      { name: "shell_capacity" },

      // { toy: "aim_time" },
      { name: "aim_time", decimals: 1, units: "s" },
      { name: "dispersion", decimals: 3, units: "m" },
      // { name: "dispersion_angle", decimals: 3, units: "m" }, // TODO: implement dispersion angle

      // { toy: "flexibility" },
      { name: "gun_depression", decimals: 0, units: "deg" },
      { name: "gun_elevation", decimals: 0, units: "deg" },
      // { name: "gun_yaw_range", decimals: 0, units: "deg" }, // TODO: implement gun yaw range
    ],
  },
  {
    group: "maneuverability",
    order: [
      // { toy: "traverse" },
      { name: "speed_forward", units: "km_h" },
      { name: "speed_backward", units: "km_h" },

      { name: "engine_power", units: "bhp" },
      // { name: "brake_force", units: "N" }, // TODO: implement brake force
      { name: "weight", decimals: 1, units: "t" },

      { name: "terrain_coefficient" },
      { name: "power_to_weight", decimals: 1, units: "bhp_t" },
      { name: "hull_traverse_speed", units: "deg_s" },
      { name: "turret_traverse_speed", units: "deg_s" },
      // { name: "gun_traverse_speed", units: "deg_s" }, // TODO: implement gun traverse speed
    ],
  },
  {
    group: "survivability",
    order: [
      { name: "health", units: "hp" },
      { name: "fire_chance", units: "%" },
      // { name: "fire_health_burn", units: "hp_s" }, // TODO: implement fire health burn
      // { name: "ramming_resistance", units: "%" }, // TODO: implement ramming resistance

      // { toy: "view_range" },
      { name: "view_range", units: "m" },
      { name: "camouflage", decimals: 0, units: "%" },

      // { name: "consumable_cooldown", decimals: 0, units: "%" }, // TODO: implement consumable cooldown
      // { name: "consumable_duration", decimals: 0, units: "s" }, // TODO: implement consumable duration
      // { name: "consumable_reload", decimals: 0, units: "s" }, // TODO: implement consumable reload

      // { name: "width", units: "m" }, // TODO: implement width
      { name: "height", units: "m" },
      { name: "length", units: "m" },
      { name: "volume", units: "m" },
    ],
  },
];
