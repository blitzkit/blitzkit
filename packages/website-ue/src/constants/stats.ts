import { TankAttributeChange_AttributeName } from "@protos/blitz_static_tank_upgrade_single_stage";

export const stats = [
  {
    name: "firepower",

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
    ],
  },

  {
    name: "maneuverability",

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
    ],
  },

  {
    name: "survivability",

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
    ],
  },
];
