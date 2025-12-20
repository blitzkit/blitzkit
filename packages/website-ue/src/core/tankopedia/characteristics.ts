import type { TankCatalogComponent } from "@protos/blitz_static_tank_component";
import {
  ShellUpgrageSingleChange_AttributeName,
  StageParameters,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import type { TankState } from "./tankState";

export type CharacteristicOutput = number | null;

type Characteristic = (helpers: {
  characteristic: (name: CharacteristicName) => CharacteristicOutput;
  attribute: (name: TankAttributeChange_AttributeName) => number;
  attributeSafe: (name: TankAttributeChange_AttributeName) => number | null;
  shell: (name: ShellUpgrageSingleChange_AttributeName) => number;
  shellSafe: (name: ShellUpgrageSingleChange_AttributeName) => number | null;
  state: TankState;
  tank: TankCatalogComponent;
  parameters: StageParameters;
}) => CharacteristicOutput;

export type CharacteristicName = keyof typeof characteristics;

export enum GunType {
  Regular,
  AutoLoader,
  AutoReloader,
}

export const characteristics = {
  gun_type({ attributeSafe, attribute }) {
    const isPump =
      attributeSafe(TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP) ??
      0;

    if (isPump === 1) return GunType.AutoReloader;

    const clipSize = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
    );

    if (clipSize === 1) return GunType.Regular;

    return GunType.AutoLoader;
  },

  clip_size({ attribute, characteristic }) {
    const gunType = characteristic("gun_type")!;

    if (gunType === GunType.Regular) return null;

    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
    );
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

      case GunType.AutoReloader: {
        return -Infinity;
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
    return (
      shell(ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_SPEED) / 100
    );
  },

  shell_range({ shellSafe }) {
    const maxDistance = shellSafe(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_MAX_DISTANCE
    );
    return maxDistance === null ? Infinity : maxDistance / 100;
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

  dispersion({ attribute, characteristic, state }) {
    const base = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_ANGLE
    );
    const movement = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_MOVEMENT
    );
    const vehicleRotation = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_ROTATION
    );
    const turretRotation = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_TURRET_ROTATION
    );
    const afterShot = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_AFTER_SHOT
    );
    const gunDamaged = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_WHILE_GUN_DAMAGED
    );
    const maxSpeed = characteristic("speed_forward") as number;

    return (
      (state.isGunDamaged ? gunDamaged : 1) *
      (base +
        (state.speed / maxSpeed) * movement +
        (state.isHullTraversing ? vehicleRotation : 0) +
        (state.isTurretTraversing ? turretRotation : 0) +
        (state.isShooting ? afterShot : 0))
    );
  },

  gun_depression({ parameters }) {
    const pitchLimit = parameters.pitch_limits_down.find(
      (pitchLimit) => pitchLimit.angle === 0
    );

    if (!pitchLimit) throw new Error("No angle 0 depression pitch limit found");

    return pitchLimit.limit;
  },

  gun_elevation({ parameters }) {
    const pitchLimit = parameters.pitch_limits_up.find(
      (pitchLimit) => pitchLimit.angle === 0
    );

    if (!pitchLimit) throw new Error("No angle 0 elevation pitch limit found");

    return pitchLimit.limit;
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
    return -Infinity;
  },

  power_to_weight_medium() {
    return -Infinity;
  },

  power_to_weight_soft() {
    return -Infinity;
  },

  turret_traverse_speed({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TURRET_ROTATION_SPEED
    );
  },

  hull_traverse_speed_hard() {
    return -Infinity;
  },

  hull_traverse_speed_medium() {
    return -Infinity;
  },

  hull_traverse_speed_soft() {
    return -Infinity;
  },

  health({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MAX_HEALTH
    );
  },

  fire_chance({ attribute }) {
    return (
      attribute(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_FIRE_START_CHANCE
      ) * 100
    );
  },

  view_range({ attribute }) {
    return (
      attribute(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CIRCULAR_VISION_RADIUS
      ) / 100
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
    return -Infinity;
  },

  camouflage_on_fire({ attributeSafe }) {
    return (
      attributeSafe(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_FIRE_PENALTY
      ) ?? -Infinity
    );
  },

  height() {
    return -Infinity;
  },

  length() {
    return -Infinity;
  },

  volume() {
    return -Infinity;
  },
} satisfies Record<string, Characteristic>;
