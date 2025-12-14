import { TankAttributeChange_AttributeName } from "@protos/blitz_static_tank_upgrade_single_stage";

export enum CharacteristicsGroup {
  Firepower,
  Maneuverability,
  Survivability,
  Miscellaneous,
}

type CharacteristicsOrder = {
  group: CharacteristicsGroup;

  characteristics: {
    name: string;
    value(
      get: (name: TankAttributeChange_AttributeName) => number
    ): number | string | null;
  }[];
}[];

export const characteristicsOrder: CharacteristicsOrder = [
  {
    group: CharacteristicsGroup.Firepower,

    characteristics: [
      {
        name: "gun_type",

        value(get) {
          const isPump = get(
            TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP
          );

          if (isPump === 1) return "auto_reloader";

          const clipSize = get(
            TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
          );

          if (clipSize === 1) return "regular";

          return "auto_loader";
        },
      },

      {
        name: "dpm",

        value(get) {
          return -1;
        },
      },

      {
        name: "clipping_potential",

        value(get) {
          const clipSize = get(
            TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
          );

          if (clipSize === 1) return null;

          // const damage

          return -1;
        },
      },
    ],
  },
];

type _CharacteristicsOrder = {
  group: CharacteristicsGroup;

  attributes: {
    name: TankAttributeChange_AttributeName;
  }[];
}[];

export const _characteristicsOrder: _CharacteristicsOrder = [
  {
    group: CharacteristicsGroup.Firepower,

    attributes: [
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_RELOAD_TIME,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_ANGLE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_AIMING_TIME,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_MOVEMENT,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_ROTATION,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_TURRET_ROTATION,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_AFTER_SHOT,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_WHILE_GUN_DAMAGED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_PITCH_LIMIT_DOWN,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_PITCH_LIMIT_UP,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_YAW_LIMIT_LEFT,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_YAW_LIMIT_RIGHT,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_RATE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_SLOTS,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BURST_SIZE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BURST_RATE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_RELOAD_SPEED_SCALE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_ARMOR_DAMAGE_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_SPEED_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_PIERCING_POWER_LOSS_REDUCTION,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ENGINE_HIT_CHANCE_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CREW_HIT_CHANCE_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_AMMO_BAY_EXPLOSION_CHANCE_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_LARGE_CALIBER_HE_PIERCING_FACTOR,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_PIERCING_MULTIPLIER_AP,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_PIERCING_MULTIPLIER_APCR,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_PIERCING_MULTIPLIER_HC,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_PIERCING_MULTIPLIER_HE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TRACER_SHELLS_ENABLED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ROTATION_RELOAD_SPEED_SCALE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ARMOR_DAMAGE_HE_SHELLS,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MODULE_DAMAGE_HE_SHELLS,
      },
    ],
  },

  {
    group: CharacteristicsGroup.Maneuverability,

    attributes: [
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_GUN_ROTATION_SPEED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TURRET_ROTATION_SPEED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_HULL_ROTATION_SPEED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ENGINE_POWER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BRAKE_FORCE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MASS,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_FORWARD_MAX_SPEED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BACKWARD_MAX_SPEED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_HARD,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_MEDIUM,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_SOFT,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_SIDE_FRICTION,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_FORWARD_FRICTION,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_RESERVE_TRACK_BACKWARD_SPEED,
      },
    ],
  },

  {
    group: CharacteristicsGroup.Survivability,

    attributes: [
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MAX_HEALTH,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_HEALTH_BURN_PER_SEC,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CIRCULAR_VISION_RADIUS,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_MOVING,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_STILL,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_FIRE_PENALTY,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_FACTOR_AT_SHOT,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_FIRE_START_CHANCE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_AVERAGE_THICKNESS,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONSUMABLE_COOLDOWN_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONSUMABLE_DURATION_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONSUMABLE_RECHARGE_SPEED_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_RAMMING_DAMAGE_RESISTANCE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_LARGE_CALIBER_HE_SHELLS_DAMAGE_RESISTANCE,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ENHANCED_TRACKS_ENABLED,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ARMOR_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MODULE_REGEN_PER_SEC_MULTIPLIER,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MODULES_DAMAGED_DEBUFF_EFFICIENCY,
      },
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MAX_FIRE_DURATION,
      },
    ],
  },

  {
    group: CharacteristicsGroup.Miscellaneous,

    attributes: [
      {
        name: TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CREW_XP_MULTIPLIER,
      },
    ],
  },
];

if (import.meta.env.DEV) {
  for (const name of Object.values(TankAttributeChange_AttributeName).filter(
    (value) => typeof value === "number"
  )) {
    if (name === TankAttributeChange_AttributeName.ATTRIBUTE_NAME_UNSPECIFIED) {
      continue;
    }

    const isImplemented = _characteristicsOrder.some((group) =>
      group.attributes.some((attribute) => attribute.name === name)
    );

    if (!isImplemented) {
      throw new Error(`Attribute ${name} is not implemented`);
    }
  }
}
