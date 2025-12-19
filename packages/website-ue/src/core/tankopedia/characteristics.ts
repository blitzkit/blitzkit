import {
  ShellUpgrageSingleChange_AttributeName,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";

export type CharacteristicOutput = number | null;

type Characteristic = (helpers: {
  characteristic: (name: CharacteristicName) => CharacteristicOutput;
  attribute: (name: TankAttributeChange_AttributeName) => number;
  attributeSafe: (name: TankAttributeChange_AttributeName) => number | null;
  shell: (name: ShellUpgrageSingleChange_AttributeName) => number;
  shellSafe: (name: ShellUpgrageSingleChange_AttributeName) => number | null;
}) => CharacteristicOutput;

export type CharacteristicName = keyof typeof characteristics;

export enum GunType {
  Regular,
  AutoLoader,
  AutoReloader,
}

export const characteristics = {
  clip_size({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
    );
  },

  gun_type({ attribute, characteristic }) {
    const isPump = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP
    );

    if (isPump === 1) return GunType.AutoReloader;

    const clipSize = characteristic("clip_size")!;

    if (clipSize === 1) return GunType.Regular;

    return GunType.AutoLoader;
  },

  damage({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_ARMOR_DAMAGE
    );
  },

  module_damage({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_MODULE_DAMAGE
    );
  },

  penetration({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_PIERCING_POWER
    );
  },

  reload({ characteristic, attribute }) {
    const gunType = characteristic("gun_type")!;

    if (gunType === GunType.AutoReloader) return null;

    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_RELOAD_TIME
    );
  },

  intra_clip({ characteristic, attribute }) {
    const gunType = characteristic("gun_type")!;

    if (gunType === GunType.Regular) return null;

    const clipRate = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_RATE
    );

    return 60 / clipRate;
  },

  dpm({ characteristic }) {
    let dps: number;
    const gunType = characteristic("gun_type")!;
    const damage = characteristic("damage")!;

    switch (gunType) {
      case GunType.Regular: {
        const reload = characteristic("reload")!;

        dps = damage / reload;
        break;
      }

      case GunType.AutoLoader: {
        const reload = characteristic("reload")!;
        const intraClip = characteristic("intra_clip")!;
        const clipSize = characteristic("clip_size")!;

        dps = (damage * clipSize) / (reload + (clipSize - 1) * intraClip);
        break;
      }

      default:
        throw new Error("Unknown gun type");
    }

    return 60 * dps;
  },

  caliber({ shell }) {
    return shell(ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_CALIBER);
  },

  normalization({ shellSafe }) {
    return shellSafe(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_NORMALIZATION
    );
  },

  ricochet({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_RICOCHET_ANGLE
    );
  },

  shell_velocity({ shell }) {
    return shell(ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_SPEED);
  },

  shell_range({ shellSafe }) {
    const maxDistance = shellSafe(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_MAX_DISTANCE
    );
    return maxDistance === null ? Infinity : maxDistance;
  },

  shell_capacity({ shellSafe }) {
    const count = shellSafe(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_MAX_COUNT
    );
    return count === -1 || count === null ? Infinity : count;
  },

  aim_time({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_AIMING_TIME
    );
  },

  dispersion_still({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_ANGLE
    );
  },

  dispersion_moving({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_MOVEMENT
    );
  },

  dispersion_hull_traversing({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_ROTATION
    );
  },

  dispersion_turret_traversing({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_TURRET_ROTATION
    );
  },

  dispersion_shooting({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_AFTER_SHOT
    );
  },

  dispersion_gun_damaged({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_WHILE_GUN_DAMAGED
    );
  },

  gun_depression({ attributeSafe }) {
    return (
      attributeSafe(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_PITCH_LIMIT_DOWN
      ) ?? -Infinity
    );
  },

  gun_elevation({ attributeSafe }) {
    return (
      attributeSafe(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_PITCH_LIMIT_UP
      ) ?? -Infinity
    );
  },

  speed_forward({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_FORWARD_MAX_SPEED
    );
  },

  speed_backward({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BACKWARD_MAX_SPEED
    );
  },

  engine_power({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ENGINE_POWER
    );
  },

  weight({ attribute }) {
    return attribute(TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MASS);
  },

  terrain_coefficient_hard({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_HARD
    );
  },

  terrain_coefficient_medium({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_MEDIUM
    );
  },

  terrain_coefficient_soft({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_SOFT
    );
  },

  power_to_weight_hard() {
    return -1;
  },

  power_to_weight_medium() {
    return -1;
  },

  power_to_weight_soft() {
    return -1;
  },

  turret_traverse_speed({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TURRET_ROTATION_SPEED
    );
  },

  hull_traverse_speed_hard() {
    return -1;
  },

  hull_traverse_speed_medium() {
    return -1;
  },

  hull_traverse_speed_soft() {
    return -1;
  },

  health({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MAX_HEALTH
    );
  },

  fire_chance({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_FIRE_START_CHANCE
    );
  },

  view_range({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CIRCULAR_VISION_RADIUS
    );
  },

  camouflage_still({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_STILL
    );
  },

  camouflage_moving({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_MOVING
    );
  },

  camouflage_shooting_still({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_FACTOR_AT_SHOT
    );
  },

  camouflage_shooting_moving() {
    return -1;
  },

  camouflage_on_fire({ attributeSafe }) {
    return (
      attributeSafe(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_FIRE_PENALTY
      ) ?? -Infinity
    );
  },

  height() {
    return -1;
  },

  length() {
    return -1;
  },

  volume() {
    return -1;
  },
} satisfies Record<string, Characteristic>;
