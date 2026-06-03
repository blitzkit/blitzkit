import { TankClass } from "@protos/blitz_static_tank_component";
import {
  ModuleUpgrade_AttributeName,
  ShellUpgradeSingleChange_AttributeName,
  StageParameters,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import type { Tank } from "@protos/tank";
import { radToDeg } from "three/src/math/MathUtils.js";
import { applyPitchYawLimits } from "./applyPitchYawLimits";
import { TerrainHardness, type TankState } from "./tankState";

export type CharacteristicOutput = number | number[] | string | null;

type Characteristic = (helpers: {
  characteristic: (name: CharacteristicName) => CharacteristicOutput;
  attribute: (name: TankAttributeChange_AttributeName) => number;
  attributeSafe: (name: TankAttributeChange_AttributeName) => number | null;
  shell: (name: ShellUpgradeSingleChange_AttributeName) => number;
  shellSafe: (name: ShellUpgradeSingleChange_AttributeName) => number | null;
  state: TankState;
  tank: Tank;
  parameters: StageParameters;
}) => CharacteristicOutput;

export type CharacteristicName = keyof typeof characteristics;

export enum GunType {
  Regular,
  AutoLoader,
  AutoReloader,
}

export const characteristics = {
  gun_type({ attributeSafe }) {
    const isPump =
      attributeSafe(TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP) ??
      0;

    if (isPump === 1) return GunType.AutoReloader;

    const clipSize = attributeSafe(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE,
    );

    if (clipSize === null || clipSize === 1) return GunType.Regular;

    return GunType.AutoLoader;
  },

  clip_size({ attribute, characteristic }) {
    const gunType = characteristic("gun_type")!;

    if (gunType === GunType.Regular) return null;

    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE,
    );
  },

  damage({ shell }) {
    return shell(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_ARMOR_DAMAGE,
    );
  },

  module_damage({ shell }) {
    return shell(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_MODULE_DAMAGE,
    );
  },

  penetration({ shell }) {
    return shell(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_PIERCING_POWER,
    );
  },

  reload({ characteristic, attribute }) {
    const gunType = characteristic("gun_type")!;

    if (gunType === GunType.AutoReloader) return null;

    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_RELOAD_TIME,
    );
  },

  reloads({ characteristic, parameters }) {
    const gunType = characteristic("gun_type")!;

    if (gunType !== GunType.AutoReloader) return null;

    return parameters.pump_reload_times;
  },

  intra_clip({ characteristic, attribute }) {
    const gunType = characteristic("gun_type")!;

    if (gunType === GunType.Regular) return null;

    const clipRate = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_RATE,
    );

    return 60 / clipRate;
  },

  optimal_shell({ characteristic }) {
    const gunType = characteristic("gun_type")!;

    if (gunType !== GunType.AutoReloader) return null;

    const intraClip = characteristic("intra_clip") as number;
    const reloads = characteristic("reloads") as number[];
    let optimal: number | undefined = undefined;

    for (let index = 0; index < reloads.length; index++) {
      const reload = reloads[index] + (index > 0 ? intraClip : 0);
      if (optimal === undefined || reload < reloads[optimal]) optimal = index;
    }

    if (optimal === undefined) {
      throw new Error("Unable to find optimal shell");
    }

    return optimal;
  },

  dpm({ characteristic }) {
    // TODO: add burst effect

    let dps: number;
    const gunType = characteristic("gun_type")!;
    const damage = characteristic("damage") as number;

    switch (gunType) {
      case GunType.Regular: {
        const reload = characteristic("reload") as number;

        dps = damage / reload;
        break;
      }

      case GunType.AutoLoader: {
        const reload = characteristic("reload") as number;
        const intraClip = characteristic("intra_clip") as number;
        const clipSize = characteristic("clip_size") as number;

        dps = (damage * clipSize) / (reload + (clipSize - 1) * intraClip);
        break;
      }

      case GunType.AutoReloader: {
        const reloads = characteristic("reloads") as number[];
        const optimalShell = characteristic("optimal_shell") as number;
        const intraClip = characteristic("intra_clip") as number;
        const reload =
          reloads[optimalShell] + (optimalShell > 0 ? intraClip : 0);

        dps = damage / reload;
        break;
      }

      default:
        throw new Error("Unknown gun type");
    }

    return 60 * dps;
  },

  caliber({ shell }) {
    return shell(ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_CALIBER);
  },

  normalization({ shellSafe }) {
    return shellSafe(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_NORMALIZATION,
    );
  },

  ricochet({ shell }) {
    return shell(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_RICOCHET_ANGLE,
    );
  },

  shell_velocity({ shell }) {
    return (
      shell(ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_SPEED) / 100
    );
  },

  shell_range({ shellSafe }) {
    const maxDistance = shellSafe(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_MAX_DISTANCE,
    );
    return maxDistance === null ? Infinity : maxDistance / 100;
  },

  shell_capacity({ shellSafe }) {
    const count = shellSafe(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_MAX_COUNT,
    );
    return count === -1 || count === null ? Infinity : count;
  },

  aim_time({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_AIMING_TIME,
    );
  },

  speed_forward({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_FORWARD_MAX_SPEED,
    );
  },

  speed_backward({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BACKWARD_MAX_SPEED,
    );
  },

  dispersion({ attribute, characteristic, state }) {
    const base = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_ANGLE,
    );
    const movement = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_MOVEMENT,
    );
    const vehicleRotation = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_VEHICLE_ROTATION,
    );
    const turretRotation = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_TURRET_ROTATION,
    );
    const afterShot = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_AFTER_SHOT,
    );
    const gunDamaged = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_DISPERSION_FACTOR_WHILE_GUN_DAMAGED,
    );
    const maxSpeed = characteristic("speed_forward") as number;

    return (
      (state.status.gun_damaged ? gunDamaged : 1) *
      (base +
        (state.speed / maxSpeed) * movement +
        (state.status.hull_traversing ? vehicleRotation : 0) +
        (state.status.turret_traversing ? turretRotation : 0) +
        (state.status.shooting ? afterShot : 0))
    );
  },

  gun_depression({ parameters }) {
    return -radToDeg(
      applyPitchYawLimits(
        -Math.PI / 2,
        0,
        parameters.pitch_limits_up,
        parameters.pitch_limits_down,
      ).pitch,
    );
  },

  gun_elevation({ parameters }) {
    return radToDeg(
      applyPitchYawLimits(
        Math.PI / 2,
        0,
        parameters.pitch_limits_up,
        parameters.pitch_limits_down,
      ).pitch,
    );
  },

  engine_power({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_ENGINE_POWER,
    );
  },

  weight({ attribute }) {
    return (
      attribute(TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MASS) / 1000
    );
  },

  terrain_coefficient({ attribute, state }) {
    let name: TankAttributeChange_AttributeName;

    switch (state.terrainHardness) {
      case TerrainHardness.Soft:
        name =
          TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_SOFT;
        break;
      case TerrainHardness.Medium:
        name =
          TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_MEDIUM;
        break;
      case TerrainHardness.Hard:
        name =
          TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TERRAIN_RESISTANCE_HARD;
        break;
    }

    return attribute(name);
  },

  power_to_weight({ characteristic }) {
    const power = characteristic("engine_power") as number;
    const weight = characteristic("weight") as number;
    const terrainCoefficient = characteristic("terrain_coefficient") as number;
    return power / weight / terrainCoefficient;
  },

  turret_traverse_speed({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_TURRET_ROTATION_SPEED,
    );
  },

  hull_traverse_speed() {
    return -Infinity;
  },

  health({ attribute }) {
    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_MAX_HEALTH,
    );
  },

  fire_chance({ attribute }) {
    return (
      attribute(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_FIRE_START_CHANCE,
      ) * 100
    );
  },

  view_range({ attribute }) {
    return (
      attribute(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CIRCULAR_VISION_RADIUS,
      ) / 100
    );
  },

  camouflage({ attribute, attributeSafe, state, tank }) {
    const base = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_STILL,
    );
    const moving =
      tank.tank!.tank_class === TankClass.TANK_CLASS_LIGHT
        ? 0
        : attribute(
            TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_MOVING,
          );
    const shooting = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_FACTOR_AT_SHOT,
    );

    if (
      attributeSafe(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CONCEALMENT_FIRE_PENALTY,
      )
    ) {
      throw new Error("Fire penalty implemented! Code it in!!");
    }

    return (
      100 *
      base *
      (1 + moving * state.speed) *
      (state.status.shooting ? shooting : 1)
    );
  },

  height() {
    return -Infinity;
  },

  length() {
    return -Infinity;
  },

  compensation({ tank }) {
    return tank.compensation!.compensation?.currency_reward?.amount ?? null;
  },

  clipping_potential({ characteristic }) {
    const gunType = characteristic("gun_type")!;

    if (gunType === GunType.Regular) return null;

    const damage = characteristic("damage") as number;
    const clipSize = characteristic("clip_size") as number;
    const clipPotential = damage * clipSize;

    return clipPotential;
  },

  burst_size({ attributeSafe }) {
    const burstSize = attributeSafe(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BURST_SIZE,
    );

    if (burstSize === null || burstSize === 1) return null;

    return burstSize;
  },

  intra_burst({ characteristic, attribute }) {
    const burstSize = characteristic("burst_size");

    if (burstSize === null) return null;

    const burstRate = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_BURST_RATE,
    );

    return 60 / burstRate;
  },

  dispersion_angle({ characteristic }) {
    const dispersion = characteristic("dispersion") as number;
    const angle = Math.atan2(dispersion / 2, 100) * (180 / Math.PI);
    return angle;
  },

  azimuth_left() {
    return -Infinity;
  },

  azimuth_right() {
    return -Infinity;
  },

  brake_force() {
    return -Infinity;
  },

  gun_traverse_speed() {
    return -Infinity;
  },

  fire_rate() {
    return -Infinity;
  },

  ramming_resistance() {
    return -Infinity;
  },

  width() {
    return -Infinity;
  },

  penetration_loss_after_ricochet({ shell }) {
    const loss = shell(
      ShellUpgradeSingleChange_AttributeName.ATTRIBUTE_NAME_PIERCING_POWER_LOSS_AFTER_HIT,
    );

    return loss;
  },

  penetration_loss_by_distance({ attributeSafe }) {
    const loss = attributeSafe(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_SHELLS_PIERCING_POWER_LOSS_REDUCTION,
    );

    return loss ?? 0;
  },
} satisfies Record<string, Characteristic>;
