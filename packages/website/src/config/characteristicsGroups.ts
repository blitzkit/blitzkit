import type { CaseType } from "@blitzkit/core";
import type { GunDefinition } from "@blitzkit/protos";
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
      { name: "damage", decimals: 0, units: "hp", localize: true },
      { name: "damage_range", decimals: 0, units: "hp", localize: true },
      { name: "module_damage", decimals: 0, units: "hp", localize: true },
      { name: "module_damage_range", decimals: 0, units: "hp", localize: true },
      {
        name: "reload",
        decimals: 1,
        units: "s",
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      {
        name: "reloads",
        decimals: 1,
        units: "s",
        ranking: CharacteristicRanking.LowerIsBetter,
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
      { name: "optimal_shell" },
      {
        name: "intra_clip",
        decimals: 2,
        units: "s",
        ranking: CharacteristicRanking.LowerIsBetter,
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
        units: "percentage",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      {
        name: "penetration_loss_after_ricochet",
        units: "percentage",
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      { name: "shell_velocity", units: "m_s" },
      { name: "shell_range", units: "m" },
      { name: "shell_capacity" },
      { name: "caliber", units: "mm" },
      {
        name: "ricochet",
        units: "deg",
        ranking: CharacteristicRanking.None,
      },
      {
        name: "normalization",
        units: "deg",
        ranking: CharacteristicRanking.None,
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
        decimals: 2,
        units: "s",
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      {
        name: "dispersion",
        decimals: 3,
        units: "m",
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      { name: "dispersion_angle", decimals: 3, units: "deg" },
      { toy: "aim_time" },
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
      { label: "speeds" },
      { name: "speed_forward", units: "km_h", indent: true },
      { name: "speed_backward", units: "km_h", indent: true },

      {
        name: "weight",
        decimals: 1,
        units: "t",
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      { name: "engine_power", units: "bhp" },
      { name: "power_to_weight", decimals: 1, units: "bhp_t" },
      // { name: "brake_force", decimals: 1, units: "kN" },

      { label: "hull_traverse_speeds" },
      { name: "hull_traverse_speed_hard", units: "deg_s", indent: true },
      { name: "hull_traverse_speed_medium", units: "deg_s", indent: true },
      { name: "hull_traverse_speed_soft", units: "deg_s", indent: true },
      { name: "turret_traverse_speed", units: "deg_s" },
      { name: "gun_traverse_speed", units: "deg_s" },

      { label: "terrain_coefficient" },
      { name: "hard_terrain_coefficient", decimals: 0, indent: true },
      { name: "medium_terrain_coefficient", decimals: 0, indent: true },
      { name: "soft_terrain_coefficient", decimals: 0, indent: true },

      { label: "raw_terrain_coefficient" },
      {
        name: "hard_terrain_coefficient_raw",
        decimals: 2,
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      {
        name: "medium_terrain_coefficient_raw",
        decimals: 2,
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      {
        name: "soft_terrain_coefficient_raw",
        decimals: 2,
        indent: true,
        ranking: CharacteristicRanking.LowerIsBetter,
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
        units: "percentage",
        ranking: CharacteristicRanking.LowerIsBetter,
      },
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
      { name: "camouflage", decimals: 0, units: "percentage" },

      { toy: "view_range" },

      {
        name: "width",
        units: "m",
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      {
        name: "height",
        units: "m",
        ranking: CharacteristicRanking.LowerIsBetter,
      },
      {
        name: "length",
        units: "m",
        ranking: CharacteristicRanking.LowerIsBetter,
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
