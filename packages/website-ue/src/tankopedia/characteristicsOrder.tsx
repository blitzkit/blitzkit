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

export interface ToyRenderConfig {
  toy: string;
}

export type CharacteristicsGroup = {
  group: string;
  render: CharacteristicsGroupRender;
  order: (CharacteristicRenderConfig | ToyRenderConfig)[];
};

export enum CharacteristicsGroupRender {
  Flashy,
  Statistical,
}

export const characteristicsOrder: CharacteristicsGroup[] = [
  {
    group: "meta",
    render: CharacteristicsGroupRender.Flashy,
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
      { name: "id" },
      { name: "slug" },
    ],
  },

  {
    group: "economics",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "purchase_price" },
      { name: "compensation" },
      { name: "upgrade_price" },
      { name: "research_level" },
      { name: "crew_xp_multiplier" },

      // TODO: investigate ATTRIBUTE_NAME_CREW_XP_MULTIPLIER
    ],
  },

  {
    group: "gun",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      {
        name: "gun_type",
        render({ output }) {
          return GunType[output as GunType];
        },
      },
      { name: "dpm", decimals: 0, units: "hp_min" },
      { name: "damage", units: "hp" },
      { name: "module_damage", units: "hp" },
      { name: "reload", decimals: 2, units: "s" },
      { name: "reloads", decimals: 2, units: "s" },

      { toy: "reload" },
    ],
  },

  {
    group: "clip",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "clipping_potential" },
      { name: "clip_size" },
      { name: "optimal_shell" },
      { name: "intra_clip", decimals: 2, units: "s" },
      { name: "burst_size" },
      { name: "intra_burst", decimals: 2, units: "s" },

      // TODO: investigate ATTRIBUTE_NAME_SHELLS_SLOTS
      // TODO: investigate ATTRIBUTE_NAME_RELOAD_SPEED_SCALE
      // TODO: investigate ATTRIBUTE_NAME_AVERAGE_THICKNESS
      // TODO: investigate ATTRIBUTE_NAME_TRACER_SHELLS_OBSERVATION_TIMEOUT
    ],
  },

  {
    group: "shell",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "penetration", units: "mm" },
      { name: "shell_velocity", units: "m_s" },
      { name: "shell_range", units: "m" },
      { name: "shell_capacity" },
      { name: "caliber", units: "mm" },
      { name: "normalization", units: "deg" },
      { name: "ricochet", units: "deg" },

      { toy: "ricochet" },
    ],
  },

  {
    group: "accuracy",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "aim_time", decimals: 1, units: "s" },
      { name: "dispersion", decimals: 3, units: "m" },
      { name: "dispersion_angle", decimals: 3, units: "m" },
      { toy: "aim_time" },
    ],
  },

  {
    group: "flexibility",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "gun_depression", decimals: 0, units: "deg" },
      { name: "gun_elevation", decimals: 0, units: "deg" },
      { name: "gun_yaw_range", decimals: 0, units: "deg" },

      { toy: "flexibility" },
    ],
  },

  {
    group: "maneuverability",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "speed_forward", units: "km_h" },
      { name: "speed_backward", units: "km_h" },

      { name: "engine_power", units: "bhp" },
      { name: "brake_force", units: "N" },
      { name: "weight", decimals: 1, units: "t" },

      { name: "terrain_coefficient" },
      { name: "power_to_weight", decimals: 1, units: "bhp_t" },

      { name: "hull_traverse_speed", units: "deg_s" },
      { name: "turret_traverse_speed", units: "deg_s" },
      { name: "gun_traverse_speed", units: "deg_s" },

      { toy: "traverse" },

      // TODO: investigate ATTRIBUTE_NAME_TERRAIN_SIDE_FRICTION
      // TODO: investigate ATTRIBUTE_NAME_TERRAIN_FORWARD_FRICTION
      // TODO: investigate ATTRIBUTE_NAME_RESERVE_TRACK_BACKWARD_SPEED
    ],
  },

  {
    group: "survivability",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "health", units: "hp" },
      { name: "fire_chance", units: "%" },
      { name: "fire_health_burn", units: "hp_s" },
      { name: "ramming_resistance", units: "%" },

      { toy: "fire_health_burn" },

      // TODO: investigate ATTRIBUTE_NAME_MAX_FIRE_DURATION
    ],
  },

  {
    group: "concealment",
    render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "view_range", units: "m" },
      { name: "camouflage", decimals: 0, units: "%" },

      { toy: "view_range" },

      { name: "width", units: "m" },
      { name: "height", units: "m" },
      { name: "length", units: "m" },
      { name: "volume", units: "m" },
    ],
  },
];
