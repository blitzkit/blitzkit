import type { CaseType } from "@blitzkit/core";
import type { GunDefinition } from "@blitzkit/protos";
import { humanBoolean } from "./characteristicsPresets";
import {
  CharacteristicRanking,
  type CharacteristicName,
  type CharacteristicRenderConfig,
  type CharacteristicsGroup,
} from "../types/characteristics";

export const characteristicsGroups: CharacteristicsGroup[] = [
  // {
  //   group: "meta",
  //   render: CharacteristicsGroupRender.Flashy,
  //   order: [
  //     {
  //       name: "name",
  //       strings: "TankEntity",
  //       render({ output, gameStrings }) {
  //         return gameStrings[output as string];
  //       },
  //     },
  //     {
  //       name: "class",
  //       render({ output, strings }) {
  //         return strings.classes.full[output as TankClass];
  //       },
  //     },
  //     {
  //       name: "type",
  //       render({ output, strings }) {
  //         return strings.types[output as TankType];
  //       },
  //     },
  //     {
  //       name: "nation",
  //       render({ output, strings }) {
  //         return strings.nations[output as Nation];
  //       },
  //     },
  //     {
  //       name: "tier",
  //       render({ output, strings }) {
  //         const name = output as string;

  //         if (name == "vintage") {
  //           return <VintageIcon />;
  //         }

  //         return strings.tiers[name as keyof typeof strings.tiers];
  //       },
  //     },
  //     { name: "id" },
  //     { name: "slug" },
  //   ],
  // },

  // {
  //   group: "economics",
  //   // render: CharacteristicsGroupRender.Statistical,
  //   order: [
  //     { name: "purchase_price" },
  //     { name: "compensation" },
  //     { name: "upgrade_price" },
  //     { name: "research_level" },
  //     { name: "crew_xp_multiplier" },

  //     // TODO: investigate ATTRIBUTE_NAME_CREW_XP_MULTIPLIER
  //   ],
  // },

  // Abilities, which only show on the tanks that have them
  {
    name: "steady_aim_system",
    sortable: false,
    order: [
      {
        name: "steady_aim_system_duration",
        decimals: 1,
        units: "s",
      },
      {
        name: "steady_aim_system_aiming_speed",
        decimals: 1,
        units: "percentage",
      },
      {
        name: "steady_aim_system_dispersion",
        ranking: CharacteristicRanking.None,
        decimals: 1,
        units: "percentage",
      },
      {
        ...humanBoolean,

        name: "steady_aim_system_activation_condition",
      },
    ],
  },

  {
    name: "burst_mode",
    sortable: false,
    order: [
      {
        name: "burst_mode_count",
        decimals: 0,
      },
      {
        name: "burst_mode_interval",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
      {
        name: "burst_mode_penetrations",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 0,
      },
      {
        ...humanBoolean,

        name: "burst_mode_target_order",
      },
    ],
  },

  {
    name: "combat_frenzy",
    sortable: false,
    order: [
      {
        name: "combat_frenzy_reload_bonus",
        decimals: 0,
        units: "percentage",
      },
      {
        name: "combat_frenzy_max_stacks",
        decimals: 0,
      },
      {
        ...humanBoolean,

        name: "combat_frenzy_keep_stacks",
      },
    ],
  },

  {
    name: "external_ammo_module",
    sortable: false,
    order: [
      {
        name: "external_ammo_module_clip_bonus",
        decimals: 0,
      },
      {
        name: "external_ammo_module_transformation",
        ranking: CharacteristicRanking.None,
        decimals: 1,
        units: "s",
      },
      {
        name: "external_ammo_module_timeout",
        ranking: CharacteristicRanking.None,
        decimals: 1,
        units: "s",
      },
      {
        ...humanBoolean,

        name: "external_ammo_module_activation_condition",
      },
    ],
  },

  {
    name: "ramming_configuration",
    sortable: false,
    order: [
      {
        name: "ramming_configuration_damage_bonus",
        decimals: 0,
        units: "percentage",
      },
      {
        name: "ramming_configuration_track_damage_bonus",
        decimals: 0,
        units: "percentage",
      },
      {
        name: "ramming_configuration_damage_reduction",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 0,
        units: "percentage",
      },
    ],
  },

  {
    name: "nitro",
    sortable: false,
    order: [
      {
        name: "nitro_duration",
        decimals: 1,
        units: "s",
      },
      {
        name: "nitro_cooling_duration",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
      {
        name: "nitro_cooldown",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
      {
        name: "nitro_engine_power",
        decimals: 0,
        units: "bhp",
      },
      {
        name: "nitro_top_speed",
        decimals: 0,
        units: "km_h",
      },
      {
        name: "nitro_rotation_speed",
        decimals: 1,
        units: "deg_s",
      },
    ],
  },

  {
    name: "shell_overheat",
    sortable: false,
    order: [
      {
        name: "shell_overheat_boost",
        decimals: 1,
        units: "percentage",
      },
      {
        name: "shell_overheat_charge_time",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
      {
        name: "shell_overheat_activation_delay",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
      {
        name: "shell_overheat_decay_time",
        ranking: CharacteristicRanking.None,
        decimals: 1,
        units: "s",
      },
      {
        name: "shell_overheat_min_speed",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 0,
        units: "km_h",
      },
      {
        name: "shell_overheat_max_speed",
        ranking: CharacteristicRanking.None,
        decimals: 0,
        units: "km_h",
      },
    ],
  },

  {
    name: "auxiliary_weapons",
    sortable: false,
    order: [
      { name: "auxiliary_weapons_shots", decimals: 0 },
      { name: "auxiliary_weapons_damage", decimals: 0 },
      { name: "auxiliary_weapons_penetration", decimals: 0, units: "mm" },
      { name: "auxiliary_weapons_shell_speed", decimals: 0, units: "m_s" },
      {
        name: "auxiliary_weapons_interval",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 2,
        units: "s",
      },
      {
        name: "auxiliary_weapons_cooldown",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 2,
        units: "s",
      },
    ],
  },

  {
    name: "unguided_rocket",
    sortable: false,
    order: [
      { name: "unguided_rocket_count", decimals: 0 },
      { name: "unguided_rocket_damage", decimals: 0 },
      { name: "unguided_rocket_penetration", decimals: 0, units: "mm" },
      { name: "unguided_rocket_initial_speed", decimals: 0, units: "m_s" },
      { name: "unguided_rocket_acceleration", decimals: 1, units: "m_s2" },
      { name: "unguided_rocket_max_distance", decimals: 0, units: "m" },
      {
        name: "unguided_rocket_intra_clip",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
      {
        name: "unguided_rocket_container_reload",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
    ],
  },

  {
    name: "assault_shells",
    sortable: false,
    order: [{ toy: "assault_shells", requires: "_assault_distances" }],
  },

  {
    name: "gun",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      {
        name: "gun_type",
        render({ output, strings }) {
          return strings.common.gun_types[
            output as CaseType<GunDefinition["gun_type"]>
          ];
        },
      },
      { name: "dpm", decimals: 0, units: "hp", localize: true },
      {
        name: "dpm_effective",
        indent: true,
        decimals: 0,
        units: "hp",
        localize: true,
      },
      {
        name: "dpm_peekaboo",
        indent: true,
        decimals: 0,
        units: "hp",
        localize: true,
      },
      { name: "damage", decimals: 0, units: "hp", localize: true },
      {
        name: "damage_range",
        indent: true,
        decimals: 0,
        units: "hp",
        localize: true,
      },
      { name: "module_damage", decimals: 0, units: "hp", localize: true },
      {
        name: "module_damage_range",
        indent: true,
        decimals: 0,
        units: "hp",
        localize: true,
      },
      {
        name: "reload",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },
      {
        name: "reloads",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "s",
      },

      { toy: "reload" },
    ],
  },

  {
    name: "clip",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "clipping_potential", localize: true, units: "hp" },
      { name: "clip_size" },
      {
        name: "optimal_shell",
        ranking: CharacteristicRanking.None,
      },
      {
        name: "intra_clip",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 2,
        units: "s",
      },
      { name: "burst_size" },
      { name: "intra_burst", decimals: 2, units: "s" },

      // TODO: investigate ATTRIBUTE_NAME_SHELLS_SLOTS
      // TODO: investigate ATTRIBUTE_NAME_RELOAD_SPEED_SCALE
      // TODO: investigate ATTRIBUTE_NAME_AVERAGE_THICKNESS
      // TODO: investigate ATTRIBUTE_NAME_TRACER_SHELLS_OBSERVATION_TIMEOUT
    ],
  },

  {
    name: "shell",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "penetration", units: "mm" },
      {
        name: "penetration_loss_by_distance",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        units: "percentage",
      },
      {
        name: "penetration_loss_after_ricochet",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        units: "percentage",
      },
      { name: "shell_velocity", units: "m_s" },
      { name: "shell_range", units: "m" },
      { name: "shell_capacity" },
      { name: "caliber", units: "mm" },
      {
        name: "ricochet",
        ranking: CharacteristicRanking.None,
        units: "deg",
      },
      {
        name: "normalization",
        ranking: CharacteristicRanking.None,
        units: "deg",
      },
      {
        name: "explosion_radius",
        ranking: CharacteristicRanking.None,
        decimals: 2,
        units: "m",
      },

      { toy: "ricochet" },
    ],
  },

  {
    name: "accuracy",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      {
        name: "aim_time",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 2,
        units: "s",
      },
      {
        name: "dispersion",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 3,
        units: "m",
      },
      { name: "dispersion_angle", decimals: 3, units: "deg" },

      { label: "dispersion_penalties" },
      {
        name: "dispersion_moving",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 3,
        units: "plus",
      },
      {
        name: "dispersion_hull_traversing",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 3,
        units: "plus",
      },
      {
        name: "dispersion_turret_traversing",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 3,
        units: "plus",
      },
      {
        name: "dispersion_shooting",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 3,
        units: "plus",
      },
      {
        name: "dispersion_gun_damaged",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "x",
      },

      // { toy: "aim_time" },
    ],
  },

  {
    name: "flexibility",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "gun_depression", decimals: 0, units: "deg" },
      { name: "gun_elevation", decimals: 0, units: "deg" },
      { name: "gun_frontal_depression", decimals: 1, units: "deg" },
      { name: "gun_frontal_elevation", decimals: 1, units: "deg" },
      { name: "gun_rear_depression", decimals: 1, units: "deg" },
      { name: "gun_rear_elevation", decimals: 1, units: "deg" },
      { name: "azimuth_left", decimals: 0, units: "deg" },
      { name: "azimuth_right", decimals: 0, units: "deg" },

      { toy: "flexibility" },
    ],
  },

  {
    name: "maneuverability",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "speed_forward", units: "km_h" },
      { name: "speed_backward", units: "km_h" },

      {
        name: "weight",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 1,
        units: "t",
      },
      { name: "engine_power", units: "bhp" },
      { name: "power_to_weight", decimals: 1, units: "bhp_t" },

      { label: "power_to_weight_on_terrain" },
      {
        name: "power_to_weight_hard",
        indent: true,
        decimals: 1,
        units: "bhp_t",
      },
      {
        name: "power_to_weight_medium",
        indent: true,
        decimals: 1,
        units: "bhp_t",
      },
      {
        name: "power_to_weight_soft",
        indent: true,
        decimals: 1,
        units: "bhp_t",
      },
      // { name: "brake_force", decimals: 1, units: "kN" },

      { label: "hull_traverse_speeds" },
      {
        name: "hull_traverse_speed_hard",
        indent: true,
        units: "deg_s",
      },
      {
        name: "hull_traverse_speed_medium",
        indent: true,
        units: "deg_s",
      },
      {
        name: "hull_traverse_speed_soft",
        indent: true,
        units: "deg_s",
      },
      { name: "turret_traverse_speed", units: "deg_s" },
      { name: "gun_traverse_speed", units: "deg_s" },

      { label: "terrain_coefficient" },
      {
        name: "hard_terrain_coefficient",
        indent: true,
        decimals: 0,
      },
      {
        name: "medium_terrain_coefficient",
        indent: true,
        decimals: 0,
      },
      {
        name: "soft_terrain_coefficient",
        indent: true,
        decimals: 0,
      },

      { label: "raw_terrain_coefficient" },
      {
        name: "hard_terrain_coefficient_raw",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 2,
      },
      {
        name: "medium_terrain_coefficient_raw",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 2,
      },
      {
        name: "soft_terrain_coefficient_raw",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 2,
      },

      { toy: "traverse" },

      // TODO: investigate ATTRIBUTE_NAME_TERRAIN_SIDE_FRICTION
      // TODO: investigate ATTRIBUTE_NAME_TERRAIN_FORWARD_FRICTION
      // TODO: investigate ATTRIBUTE_NAME_RESERVE_TRACK_BACKWARD_SPEED
    ],
  },

  {
    name: "survivability",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "health", units: "hp" },
      {
        name: "fire_chance",
        ranking: CharacteristicRanking.LowerIsBetter,
        decimals: 0,
        units: "percentage",
      },
      { name: "crew_count" },
      // { name: "fire_rate", units: "hp_s" },
      // { name: "ramming_resistance", units: "percentage" },

      // { toy: "fire_health_burn" },

      // TODO: investigate ATTRIBUTE_NAME_MAX_FIRE_DURATION
    ],
  },

  {
    name: "concealment",
    // render: CharacteristicsGroupRender.Statistical,
    order: [
      { name: "view_range", units: "m" },

      { label: "camouflages" },
      {
        name: "camouflage",
        indent: true,
        decimals: 2,
        units: "percentage",
      },
      {
        name: "camouflage_moving",
        indent: true,
        decimals: 2,
        units: "percentage",
      },
      {
        name: "camouflage_shooting_still",
        indent: true,
        decimals: 2,
        units: "percentage",
      },
      {
        name: "camouflage_shooting_moving",
        indent: true,
        decimals: 2,
        units: "percentage",
      },
      {
        name: "camouflage_on_fire",
        indent: true,
        decimals: 2,
        units: "percentage",
      },

      { toy: "view_range" },

      {
        name: "width",
        ranking: CharacteristicRanking.LowerIsBetter,
        units: "m",
      },
      {
        name: "height",
        ranking: CharacteristicRanking.LowerIsBetter,
        units: "m",
      },
      {
        name: "length",
        ranking: CharacteristicRanking.LowerIsBetter,
        units: "m",
      },
    ],
  },
];

export const characteristicRenderConfigs = new Map<
  CharacteristicName,
  CharacteristicRenderConfig
>();

for (const group of characteristicsGroups) {
  for (const config of group.order) {
    if (!("name" in config)) continue;
    characteristicRenderConfigs.set(config.name, config);
  }
}
