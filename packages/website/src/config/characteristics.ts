import {
  blitzkitToBlitzShellKind,
  isExplosive,
  normalizeBoundingBox,
  unionBoundingBox,
} from "@blitzkit/core";
import { ShellType, TankClass } from "@blitzkit/protos";
import type { Vector2Tuple } from "three";
import { shellSlot } from "../tankopedia/augments";
import { hullTraverseSpeed } from "../tankopedia/hullTraverseSpeed";
import { rawTerrainCoefficient } from "../tankopedia/rawTerrainCoefficient";
import { tankClassToBlitzTankClass } from "../tankopedia/tankClass";
import {
  CharacteristicType,
  type Characteristic,
} from "../types/characteristics";

/**
 * peek-a-boo assumes at least this many seconds between shots to account for
 * peeking out, aiming, and retreating
 */
const PEEKABOO_MIN_CYCLE = 10;

// characteristics prefixed with an underscore are compute time only; they are never rendered
export const characteristics = {
  gun_type: {
    type: CharacteristicType.Enum,

    compute({ gun }) {
      return gun.gun_type!.$case;
    },
  },

  // Compute time only: damage before the assault shell falloff
  _base_damage: {
    type: CharacteristicType.Number,

    compute({ shell, environment, equalizer, script, gun, augment }) {
      let coefficient = 1;

      if (environment.equalize) coefficient *= equalizer.damage;

      script("protagonist", "TungstenTip", (effect) => {
        coefficient *= (effect.minDamageFactor + effect.maxDamageFactor) / 2;
      });

      script("antagonist", "ShieldKit", (effect) => {
        if (shell.type === ShellType.SHELL_TYPE_HE) return;
        coefficient *= 1 - effect.shieldCoef;
      });

      script("antagonist", "ArmorMover", (effect) => {
        coefficient *= 1 - effect.bonusValues!.damageReductionPercent / 100;
      });

      script("antagonist", "AntiHighExplosive", (effect) => {
        if (shell.type !== ShellType.SHELL_TYPE_HE) return;
        coefficient *= effect.bonusValues!.factor;
      });

      let damage = shell.armor_damage;

      augment(`SHELL_DAMAGE_SLOT_${shellSlot(gun, shell)}`, (value) => {
        damage += value;
      });

      return coefficient * damage;
    },
  },

  damage: {
    type: CharacteristicType.Number,

    compute({ shell, environment, gun, characteristic }) {
      const damage = characteristic("_base_damage") as number;

      if (!gun.assault_ranges?.types.includes(shell.type)) return damage;

      const range = gun.assault_ranges.ranges.find(
        ({ distance }) => distance >= environment.distance,
      );

      return damage * (range?.factor ?? 0);
    },
  },

  _reload_coefficient: {
    type: CharacteristicType.Number,

    compute({ script, degressive, gun }) {
      let c0 = 1;

      script("protagonist", "miscAttrs/gunReloadTimeFactor", (effect) => {
        c0 += effect.bonusValues!.percent / 100;
      });

      const c1 = degressive("loader");

      let c2 = 1;

      // adrenaline only affects regular guns
      if (gun.gun_type!.$case === "regular") {
        script("protagonist", "Berserk", (effect) => {
          c2 += effect.bonusValues!.gunReloadSpeedIncrease / 100;
        });
      }

      return (c0 * c1) / c2;
    },
  },

  reload: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case !== "auto_reloader";
    },

    compute({ gun, characteristic, augment }): number {
      if (gun.gun_type!.$case === "auto_reloader") return -Infinity;

      const c = characteristic("_reload_coefficient") as number;
      let reload = 0;

      augment("GUN_RELOAD_TIME", (value) => {
        reload += value;
      });

      if (gun.gun_type!.$case === "regular") {
        reload += gun.gun_type!.value.reload;
      } else {
        reload += gun.gun_type!.value.clip_reload;
      }

      return c * reload;
    },
  },

  reloads: {
    type: CharacteristicType.NumberList,

    should_render({ gun }) {
      return gun.gun_type!.$case === "auto_reloader";
    },

    compute({ gun, characteristic, augment }) {
      if (gun.gun_type!.$case !== "auto_reloader") return [];

      const reloadCoefficient = characteristic("_reload_coefficient") as number;
      let bonus = 0;

      augment("GUN_RELOAD_TIME", (value) => {
        bonus += value;
      });

      return gun.gun_type!.value.shell_reloads.map((base) => {
        let reload = base;

        reload += bonus;

        return reload * reloadCoefficient;
      });
    },
  },

  intra_clip: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case !== "regular";
    },

    compute({ gun, script }) {
      if (gun.gun_type!.$case === "regular") return 0;

      let c = 1;

      script("protagonist", "NewAutoloader", (effect) => {
        c = effect.clipReloadTimeFactor;
      });

      return c * gun.gun_type!.value.intra_clip;
    },
  },

  // time per shot when continuously firing the fastest shell of an auto reloader
  _optimal_shell_cycle: {
    type: CharacteristicType.Number,

    compute({ gun, characteristic }) {
      if (gun.gun_type!.$case !== "auto_reloader") return 0;

      const intraClip = characteristic("intra_clip") as number;
      const reloads = characteristic("reloads") as number[];

      return Math.min(
        ...reloads.map((reload, index) => reload + (index > 0 ? intraClip : 0)),
      );
    },
  },

  dpm: {
    type: CharacteristicType.Number,

    compute({ gun, characteristic }): number {
      const alpha = characteristic("damage") as number;

      let dps: number;

      if (gun.gun_type!.$case === "regular") {
        const reload = characteristic("reload") as number;
        dps = alpha / reload;
      } else if (gun.gun_type!.$case === "auto_loader") {
        const damage = alpha * gun.gun_type!.value.shell_count;

        const intraClip = characteristic("intra_clip") as number;
        let time = characteristic("reload") as number;

        if (gun.burst) {
          time +=
            (gun.gun_type!.value.shell_count / gun.burst.count - 1) * intraClip;

          time +=
            (gun.gun_type!.value.shell_count / gun.burst.count) *
            (gun.burst.count - 1) *
            gun.burst.interval;
        } else {
          time += (gun.gun_type!.value.shell_count - 1) * intraClip;
        }

        dps = damage / time;
      } else {
        dps = alpha / (characteristic("_optimal_shell_cycle") as number);
      }

      return dps * 60;
    },
  },

  dpm_peekaboo: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case === "regular";
    },

    compute({ characteristic }): number {
      const damage = characteristic("damage") as number;
      const reload = characteristic("reload") as number;

      return damage * (60 / Math.max(reload, PEEKABOO_MIN_CYCLE));
    },
  },

  dpm_effective: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case === "auto_reloader";
    },

    compute({ characteristic }): number {
      const damage = characteristic("damage") as number;
      const reloads = characteristic("reloads") as number[];
      const intraClip = characteristic("intra_clip") as number;

      // dump every other shell at the intra clip rate, spend the rest of the
      // minute cycling the optimal shell; ordering doesn't change the total
      const rest = reloads.length - 1;
      const cycle = characteristic("_optimal_shell_cycle") as number;

      let dpm = damage * rest;

      dpm += (damage * (60 - rest * intraClip)) / cycle;

      return dpm;
    },
  },

  // damage rolls within +-25% unless tungsten tips raise the lower end
  _damage_spread: {
    type: CharacteristicType.Interval,

    compute({ script }) {
      let low = 0.75;
      let high = 1.25;

      script("protagonist", "TungstenTip", (effect) => {
        low = effect.minDamageFactor;
        high = effect.maxDamageFactor;
      });

      return [low, high] satisfies Vector2Tuple;
    },
  },

  damage_range: {
    type: CharacteristicType.Interval,

    compute({ characteristic }): Vector2Tuple {
      const [low, high] = characteristic("_damage_spread") as Vector2Tuple;

      // damage already folds in the average of the spread
      const base = (characteristic("damage") as number) / ((low + high) / 2);

      return [base * low, base * high];
    },
  },

  module_damage: {
    type: CharacteristicType.Number,
    compute({ shell, script }) {
      let c = 1;

      script("protagonist", "TungstenTip", (effect) => {
        c *= (effect.minDamageFactor + effect.maxDamageFactor) / 2;
      });

      return c * shell.module_damage;
    },
  },

  module_damage_range: {
    type: CharacteristicType.Interval,

    compute({ characteristic }): Vector2Tuple {
      const [low, high] = characteristic("_damage_spread") as Vector2Tuple;
      const base =
        (characteristic("module_damage") as number) / ((low + high) / 2);

      return [base * low, base * high];
    },
  },

  clip_size: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case !== "regular";
    },

    compute({ gun }) {
      if (gun.gun_type!.$case === "regular") return 1;
      return gun.gun_type!.value.shell_count;
    },
  },

  clipping_potential: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case !== "regular";
    },

    compute({ characteristic }): number {
      const clipSize = characteristic("clip_size") as number;
      const damage = characteristic("damage") as number;

      return clipSize * damage;
    },
  },

  /**
   * 1-indexed so that it can be rendered as-is
   */
  optimal_shell: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case === "auto_reloader";
    },

    compute({ characteristic }): number {
      const reloads = characteristic("reloads") as number[];
      const intraClip = characteristic("intra_clip") as number;

      let best = 0;
      let bestTime = Infinity;

      reloads.forEach((reload, index) => {
        const time = reload + (index > 0 ? intraClip : 0);

        if (time < bestTime) {
          best = index;
          bestTime = time;
        }
      });

      return best + 1;
    },
  },

  burst_size: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.burst !== undefined;
    },

    compute({ gun }) {
      return gun.burst!.count;
    },
  },

  intra_burst: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.burst !== undefined;
    },

    compute({ gun }) {
      return gun.burst!.interval;
    },
  },

  penetration: {
    type: CharacteristicType.Number,

    compute({ gun, shell, environment, equalizer, script, augment }) {
      let c = 1;

      script("protagonist", "CalibratedShells", (effect) => {
        c +=
          effect.piercingFactors![blitzkitToBlitzShellKind[shell.type]] / 100;
      });

      if (environment.equalize) c *= equalizer.penetration;

      let penetration = shell.penetration!.near;

      augment(
        `SHELL_PIERCING_POWER_100_SLOT_${shellSlot(gun, shell)}`,
        (value) => {
          penetration += value;
        },
      );

      return c * penetration;
    },
  },

  penetration_loss_by_distance: {
    type: CharacteristicType.Number,

    compute({ gun, shell, script, augment }) {
      let c = 1;

      script("protagonist", "StaticMiscAttrsModifier", (effect) => {
        c += effect.bonusValues!.piercingPenaltyFactor500m / 100;
      });

      const slot = shellSlot(gun, shell);
      let near = shell.penetration!.near;
      let far = shell.penetration!.far;

      augment(`SHELL_PIERCING_POWER_100_SLOT_${slot}`, (value) => {
        near += value;
      });
      augment(`SHELL_PIERCING_POWER_500_SLOT_${slot}`, (value) => {
        far += value;
      });

      const loss = (near - far) / near;

      return 100 * c * loss;
    },
  },

  penetration_loss_after_ricochet: {
    type: CharacteristicType.Number,

    should_render({ shell }) {
      return !isExplosive(shell.type);
    },

    compute() {
      return 25;
    },
  },

  shell_velocity: {
    type: CharacteristicType.Number,

    compute({ gun, shell, script, augment }) {
      let c = 1;

      script("protagonist", "StaticMiscAttrsModifier", (effect) => {
        c += effect.bonusValues!.projectileSpeedFactor / 100;
      });

      script("protagonist", "GunPowder", (effect) => {
        c += effect.bonusValues!.projectileSpeedFactor / 100;
      });

      let velocity = shell.velocity;

      augment(`SHELL_SPEED_SLOT_${shellSlot(gun, shell)}`, (value) => {
        velocity += value;
      });

      return c * velocity;
    },
  },

  shell_range: {
    type: CharacteristicType.Number,

    compute({ shell }) {
      return shell.range;
    },
  },

  shell_capacity: {
    type: CharacteristicType.Number,

    compute({ gun }) {
      return gun.shell_capacity;
    },
  },

  caliber: {
    type: CharacteristicType.Number,

    compute({ shell }) {
      return shell.caliber;
    },
  },

  ricochet: {
    type: CharacteristicType.Number,

    should_render({ shell }) {
      return !isExplosive(shell.type);
    },

    compute({ shell }) {
      return shell.ricochet ?? 0;
    },
  },

  normalization: {
    type: CharacteristicType.Number,

    should_render({ shell }) {
      return !isExplosive(shell.type);
    },

    compute({ shell }) {
      return shell.normalization ?? 0;
    },
  },

  explosion_radius: {
    type: CharacteristicType.Number,

    should_render({ shell }) {
      return shell.explosion_radius !== undefined;
    },

    compute({ shell }) {
      return shell.explosion_radius!;
    },
  },

  speed_forward: {
    type: CharacteristicType.Number,
    compute({ tank, script, augment }) {
      let speed = tank.speed_forwards;
      let factor = 1;

      augment("FORWARD_MAX_SPEED", (value) => {
        speed += value;
      });

      script("protagonist", "GearOil", (effect) => {
        speed += effect.bonusValues?.fwdSpeedLimitBias ?? 0;
      });

      script("protagonist", "ImprovedAfterburning", (effect) => {
        speed += effect.fwdSpeedLimitBias ?? 0;
      });

      script("protagonist", "AttributesModifier", (effect) => {
        factor *= effect.attributes?.speedLimitsFactor ?? 1;
      });

      return speed * factor;
    },
  },

  speed_backward: {
    type: CharacteristicType.Number,
    compute({ tank, script, augment }) {
      let speed = tank.speed_backwards;
      let factor = 1;

      augment("BACKWARD_MAX_SPEED", (value) => {
        speed += value;
      });

      script("protagonist", "GearOil", (effect) => {
        speed += effect.bonusValues?.bkwdSpeedLimitBias ?? 0;
      });

      script("protagonist", "ImprovedAfterburning", (effect) => {
        speed += effect.bkwdSpeedLimitBias ?? 0;
      });

      script("protagonist", "AttributesModifier", (effect) => {
        factor *= effect.attributes?.speedLimitsFactor ?? 1;
      });

      return speed * factor;
    },
  },

  aim_time: {
    type: CharacteristicType.Number,
    compute({ tank, gun, turret, track, degressive, script }): number {
      /*
      Mirrors how the game computes aim time in the hangar. Consumables such as
      FireControlSystem are battle-time only and are not part of it.

      T = (A × C) × ln(√(1 + k² × S)) / (1 − p/100)

      S = (turret rotation speed × turret dispersion factor)²
        + (hull rotation speed × hull dispersion factor)²
        + (min(raw top speed, 30) × movement dispersion factor)²
      raw top speed is the vehicle's unmodified forward speed limit; equipment
      and engine modifiers do not affect it here.
      A: the gun’s raw aimingTime—the time for the reticle to shrink by a factor of e ≈ 2.718.
      C: gunner degressive crew factor (the reciprocal of the game's gunner value, which divides the time).
      k: stabilization multiplier; normally 1, reduced by the stabilizer.
      p: signed aiming-drive modifier. For −12%, the displayed time is divided by 1.12, reducing it by approximately 10.7%.
      */

      const S =
        (turret.traverse_speed * gun.dispersion_traverse) ** 2 +
        (track.traverse_speed * track.dispersion_traverse) ** 2 +
        (Math.min(tank.speed_forwards, 30) * track.dispersion_move) ** 2;

      const A = gun.aim_time;
      const C = degressive("gunner");

      let p = 0;

      script("protagonist", "miscAttrs/gunAimingTimeFactor", (effect) => {
        p += effect.bonusValues!.percent / 100;
      });

      let k = 1;

      script(
        "protagonist",
        "miscAttrs/additiveShotDispersionFactor",
        (effect) => {
          k += effect.bonusValues!.percent / 100;
        },
      );

      const T = (A * C * Math.log(Math.sqrt(1 + k ** 2 * S))) / (1 - p);

      return T;
    },
  },

  dispersion: {
    type: CharacteristicType.Number,
    compute({ gun, degressive, script, augment }) {
      let coefficient = 1;

      augment("DISPERSION_ANGLE_FACTOR_BONUS", (value) => {
        coefficient += value;
      });

      script("protagonist", "miscAttrs/shotDispersionAngleFactor", (effect) => {
        coefficient += effect.bonusValues!.percent / 100;
      });

      script("protagonist", "FireControlSystem", (effect) => {
        coefficient *= effect.shotDispersionAngleFactor;
      });

      return gun.dispersion_base * degressive("gunner") * coefficient;
    },
  },

  _stabilizer_coefficient: {
    type: CharacteristicType.Number,
    compute({ script }) {
      let coefficient = 0;

      script(
        "protagonist",
        "miscAttrs/additiveShotDispersionFactor",
        (effect) => {
          coefficient += effect.bonusValues!.percent / 100;
        },
      );

      return coefficient;
    },
  },

  _camouflage_bonus: {
    type: CharacteristicType.Number,
    compute({ tank, state }) {
      if (!state.camouflage) return 0;

      switch (tank.class) {
        case TankClass.TANK_CLASS_TANK_DESTROYER:
          return 0.04;
        case TankClass.TANK_CLASS_HEAVY:
          return 0.03;
        default:
          return 0.02;
      }
    },
  },

  _camouflage_net_bonus_still: {
    type: CharacteristicType.Number,
    compute({ tank, script }) {
      let bonus = 0;

      script("protagonist", "CamouflageNet", (effect) => {
        const base = effect.bonus?.[tankClassToBlitzTankClass[tank.class]] ?? 0;

        bonus += base * (effect.activateBonusFactor ?? 1);
      });

      return bonus;
    },
  },

  _camouflage_net_bonus_moving: {
    type: CharacteristicType.Number,
    compute({ tank, script }) {
      let bonus = 0;

      script("protagonist", "CamouflageNet", (effect) => {
        const base = effect.bonus?.[tankClassToBlitzTankClass[tank.class]] ?? 0;

        bonus += base * 1;
      });

      return bonus;
    },
  },

  dispersion_moving: {
    type: CharacteristicType.Number,
    compute(context): number {
      const skill = (context.environment.skills.smooth_driving ?? 0) / 100;

      const stabilizer = context.characteristic(
        "_stabilizer_coefficient",
      ) as number;
      let coefficient = 1;

      context.augment("DISPERSION_VEHICLE_MOVEMENT_FACTOR", (value) => {
        coefficient *= value;
      });

      coefficient *= 1 + stabilizer - skill;

      return context.track.dispersion_move * coefficient;
    },
  },

  dispersion_hull_traversing: {
    type: CharacteristicType.Number,
    compute(context): number {
      const skill = (context.environment.skills.smooth_turn ?? 0) / 100;

      const stabilizer = context.characteristic(
        "_stabilizer_coefficient",
      ) as number;
      let coefficient = 1;

      context.augment("DISPERSION_VEHICLE_ROTATION_FACTOR", (value) => {
        coefficient *= value;
      });

      coefficient *= 1 + stabilizer - skill;

      return context.track.dispersion_traverse * coefficient;
    },
  },

  dispersion_turret_traversing: {
    type: CharacteristicType.Number,
    compute(context): number {
      const skill = (2 * (context.environment.skills.smooth_turret ?? 0)) / 100;

      const stabilizer = context.characteristic(
        "_stabilizer_coefficient",
      ) as number;
      let coefficient = 1;

      context.augment("DISPERSION_TURRET_ROTATION_FACTOR", (value) => {
        coefficient *= value;
      });

      coefficient *= 1 + stabilizer - skill;

      return context.gun.dispersion_traverse * coefficient;
    },
  },

  dispersion_shooting: {
    type: CharacteristicType.Number,
    compute(context): number {
      const skill = (context.environment.skills.soft_recoil ?? 0) / 100;

      const stabilizer = context.characteristic(
        "_stabilizer_coefficient",
      ) as number;
      const coefficient = 1 + stabilizer - skill;

      return context.gun.dispersion_shot * coefficient;
    },
  },

  dispersion_gun_damaged: {
    type: CharacteristicType.Number,
    compute(context): number {
      const stabilizer = context.characteristic(
        "_stabilizer_coefficient",
      ) as number;
      const coefficient = 1 + stabilizer;

      return context.gun.dispersion_damaged * coefficient;
    },
  },

  dispersion_angle: {
    type: CharacteristicType.Number,
    compute({ characteristic }) {
      // Dispersion is the radius of the circle at 100 m
      const dispersion = characteristic("dispersion") as number;

      return Math.atan(dispersion / 100) * (180 / Math.PI);
    },
  },

  gun_depression: {
    type: CharacteristicType.Number,
    compute({ state, turret, gun, script, augment }) {
      const turretModel = state.model.turrets[turret.id];
      const gunModel = turretModel.guns[gun.id];
      let depression = gunModel.pitch!.max;

      depression += state.model.initial_turret_rotation?.pitch ?? 0;
      augment("PITCH_LIMIT_DOWN", (value) => {
        depression += value;
      });

      script("protagonist", "ImprovedPitchLimitsSystem", (effect) => {
        depression += effect.bonusValues?.lowerPitchLimitIncrease ?? 0;
      });

      return depression;
    },
  },

  gun_elevation: {
    type: CharacteristicType.Number,
    compute({ state, turret, gun, script, augment }) {
      const turretModel = state.model.turrets[turret.id];
      const gunModel = turretModel.guns[gun.id];
      let elevation = -gunModel.pitch!.min;

      elevation -= state.model.initial_turret_rotation?.pitch ?? 0;
      augment("PITCH_LIMIT_UP", (value) => {
        elevation += value;
      });

      script("protagonist", "ImprovedPitchLimitsSystem", (effect) => {
        elevation += effect.bonusValues?.upperPitchLimitIncrease ?? 0;
      });

      return elevation;
    },
  },

  gun_frontal_depression: {
    type: CharacteristicType.Number,
    should_render({ state, turret, gun }) {
      return (
        state.model.turrets[turret.id].guns[gun.id].pitch!.front !== undefined
      );
    },
    compute({ state, turret, gun }) {
      return state.model.turrets[turret.id].guns[gun.id].pitch!.front!.max;
    },
  },

  gun_frontal_elevation: {
    type: CharacteristicType.Number,
    should_render({ state, turret, gun }) {
      return (
        state.model.turrets[turret.id].guns[gun.id].pitch!.front !== undefined
      );
    },
    compute({ state, turret, gun }) {
      return -state.model.turrets[turret.id].guns[gun.id].pitch!.front!.min;
    },
  },

  gun_rear_depression: {
    type: CharacteristicType.Number,
    should_render({ state, turret, gun }) {
      return (
        state.model.turrets[turret.id].guns[gun.id].pitch!.back !== undefined
      );
    },
    compute({ state, turret, gun }) {
      return state.model.turrets[turret.id].guns[gun.id].pitch!.back!.max;
    },
  },

  gun_rear_elevation: {
    type: CharacteristicType.Number,
    should_render({ state, turret, gun }) {
      return (
        state.model.turrets[turret.id].guns[gun.id].pitch!.back !== undefined
      );
    },
    compute({ state, turret, gun }) {
      return -state.model.turrets[turret.id].guns[gun.id].pitch!.back!.min;
    },
  },

  azimuth_left: {
    type: CharacteristicType.Number,
    should_render({ state, turret }) {
      return state.model.turrets[turret.id].yaw !== undefined;
    },
    compute({ state, turret }) {
      return -state.model.turrets[turret.id].yaw!.min;
    },
  },

  azimuth_right: {
    type: CharacteristicType.Number,
    should_render({ state, turret }) {
      return state.model.turrets[turret.id].yaw !== undefined;
    },
    compute({ state, turret }) {
      return state.model.turrets[turret.id].yaw!.max;
    },
  },

  weight: {
    type: CharacteristicType.Number,
    compute({ tank, engine, track, turret, gun }) {
      let weight = tank.weight;

      weight += engine.weight;
      weight += track.weight;
      weight += turret.weight;
      weight += gun.weight;

      return weight / 1000;
    },
  },

  _engine_power_coefficient: {
    type: CharacteristicType.Number,
    compute({ tank, script }) {
      let coefficient = 1;

      const tankClass = tankClassToBlitzTankClass[tank.class];

      script("protagonist", "RecycledEngine", (effect) => {
        coefficient +=
          (effect.enginePowerPercentageBonus?.[tankClass] ?? 0) / 100;
      });

      script("protagonist", "Afterburning", (effect) => {
        coefficient += (effect.bonusValues?.enginePowerIncrease ?? 0) / 100;
      });

      script("protagonist", "ImprovedAfterburning", (effect) => {
        coefficient += (effect.enginePowerIncrease ?? 1) - 1;
      });

      script("protagonist", "Fuel", (effect) => {
        coefficient += (effect.bonusValues?.enginePowerIncrease ?? 0) / 100;
      });

      script("protagonist", "GearOil", (effect) => {
        coefficient += (effect.bonusValues?.enginePowerIncrease ?? 0) / 100;
      });

      script("protagonist", "AttributesModifier", (effect) => {
        coefficient *= effect.attributes?.enginePowerFactor ?? 1;
      });

      return coefficient;
    },
  },

  engine_power: {
    type: CharacteristicType.Number,
    // explicit return type breaks the circular inference through characteristic()
    compute({ engine, characteristic, augment }): number {
      const coefficient = characteristic("_engine_power_coefficient") as number;
      let power = engine.power;

      augment("ENGINE_POWER", (value) => {
        power += value;
      });

      return power * coefficient;
    },
  },

  power_to_weight: {
    type: CharacteristicType.Number,
    compute({ characteristic }): number {
      const enginePower = characteristic("engine_power") as number;
      const weight = characteristic("weight") as number;

      return enginePower / weight;
    },
  },

  // brake_force: unavailable,

  hard_terrain_coefficient_raw: {
    type: CharacteristicType.Number,
    compute({ track, degressive, script }) {
      return rawTerrainCoefficient(
        track.resistance_hard,
        "firmGroundPassabilityIncrease",
        degressive("driver"),
        script,
      );
    },
  },

  hard_terrain_coefficient: {
    type: CharacteristicType.Number,
    compute({ characteristic }): number {
      const raw = characteristic("hard_terrain_coefficient_raw") as number;
      return 100 / raw;
    },
  },

  medium_terrain_coefficient_raw: {
    type: CharacteristicType.Number,
    compute({ track, degressive, script }) {
      return rawTerrainCoefficient(
        track.resistance_medium,
        "mediumGroundPassabilityIncrease",
        degressive("driver"),
        script,
      );
    },
  },

  medium_terrain_coefficient: {
    type: CharacteristicType.Number,
    compute({ characteristic }): number {
      const raw = characteristic("medium_terrain_coefficient_raw") as number;
      return 100 / raw;
    },
  },

  soft_terrain_coefficient_raw: {
    type: CharacteristicType.Number,
    compute({ track, degressive, script }) {
      return rawTerrainCoefficient(
        track.resistance_soft,
        "softGroundPassabilityIncrease",
        degressive("driver"),
        script,
      );
    },
  },

  soft_terrain_coefficient: {
    type: CharacteristicType.Number,
    compute({ characteristic }): number {
      const raw = characteristic("soft_terrain_coefficient_raw") as number;
      return 100 / raw;
    },
  },

  power_to_weight_hard: {
    type: CharacteristicType.Number,
    compute({ characteristic }): number {
      const powerToWeight = characteristic("power_to_weight") as number;
      const raw = characteristic("hard_terrain_coefficient_raw") as number;

      return powerToWeight / raw;
    },
  },

  power_to_weight_medium: {
    type: CharacteristicType.Number,
    compute({ characteristic }): number {
      const powerToWeight = characteristic("power_to_weight") as number;
      const raw = characteristic("medium_terrain_coefficient_raw") as number;

      return powerToWeight / raw;
    },
  },

  power_to_weight_soft: {
    type: CharacteristicType.Number,
    compute({ characteristic }): number {
      const powerToWeight = characteristic("power_to_weight") as number;
      const raw = characteristic("soft_terrain_coefficient_raw") as number;

      return powerToWeight / raw;
    },
  },

  hull_traverse_speed_hard: {
    type: CharacteristicType.Number,
    compute(context): number {
      return hullTraverseSpeed(
        context.characteristic("hard_terrain_coefficient_raw") as number,
        context,
      );
    },
  },

  hull_traverse_speed_medium: {
    type: CharacteristicType.Number,
    compute(context): number {
      return hullTraverseSpeed(
        context.characteristic("medium_terrain_coefficient_raw") as number,
        context,
      );
    },
  },

  hull_traverse_speed_soft: {
    type: CharacteristicType.Number,
    compute(context): number {
      return hullTraverseSpeed(
        context.characteristic("soft_terrain_coefficient_raw") as number,
        context,
      );
    },
  },

  _turret_traverse_coefficient: {
    type: CharacteristicType.Number,
    compute({ progressive, script, augment }) {
      let c = 1;

      augment("TURRET_ROTATION_SPEED_FACTOR_BONUS", (value) => {
        c += value;
      });

      script("protagonist", "Fuel", (effect) => {
        c += (effect.bonusValues?.turretRotationSpeedIncrease ?? 0) / 100;
      });

      return c * progressive("gunner");
    },
  },

  turret_traverse_speed: {
    type: CharacteristicType.Number,
    compute({ turret, characteristic }): number {
      const c = characteristic("_turret_traverse_coefficient") as number;
      return turret.traverse_speed * c;
    },
  },

  gun_traverse_speed: {
    type: CharacteristicType.Number,
    compute({ gun, characteristic }): number {
      const c = characteristic("_turret_traverse_coefficient") as number;
      return gun.rotation_speed * c;
    },
  },

  health: {
    type: CharacteristicType.Number,
    compute({ tank, turret, environment, equalizer, script, augment }) {
      let c0 = 1;

      script("protagonist", "SmallHPStock", (effect) => {
        c0 += effect.hpStockPercent / 100;
      });

      script("protagonist", "HighQualityAssembly", (effect) => {
        c0 += effect.maxHpBonusPercent / 100;
      });

      let c1 = 1;

      if (environment.equalize) {
        c1 *= equalizer.health;
      }

      let health = tank.health;

      health += turret.health;
      augment("MAX_HEALTH", (value) => {
        health += value;
      });
      health *= c0 * c1;

      if (environment.equalize) {
        health = 50 * Math.round(health / 50);
      }

      return health;
    },
  },

  fire_chance: {
    type: CharacteristicType.Number,
    compute({ engine, script, augment }) {
      // Augments are a fraction of the chance, not points of it
      let c = 1;

      augment("FIRE_START_CHANCE", (value) => {
        c += value;
      });

      script("protagonist", "SafetySet", (effect) => {
        c -= (effect.bonusValues?.fireProtectionIncrease ?? 0) / 100;
      });

      return 100 * Math.max(0, c) * engine.fire_chance;
    },
  },

  // fire_rate: unavailable,
  // ramming_resistance: unavailable,

  crew_count: {
    type: CharacteristicType.Number,
    compute({ tank }) {
      return tank.crew.length;
    },
  },

  view_range: {
    type: CharacteristicType.Number,
    compute({ tank, turret, progressive, script }) {
      let c = 1;

      script("protagonist", "CoatedOptics", (effect) => {
        c +=
          (effect.visionRadiusPercentageBonus?.[
            tankClassToBlitzTankClass[tank.class]
          ] ?? 0) / 100;
      });

      return turret.view_range * c * progressive("commander");
    },
  },

  /**
   * camouflage characteristics are stored as percentages
   */
  camouflage: {
    type: CharacteristicType.Number,
    compute(context): number {
      const skill = (3 * (context.environment.skills.camouflage ?? 0)) / 100;
      const c =
        1 +
        (context.characteristic("_camouflage_bonus") as number) +
        skill +
        (context.characteristic("_camouflage_net_bonus_still") as number);

      return 100 * context.tank.camouflage_still * c;
    },
  },

  camouflage_moving: {
    type: CharacteristicType.Number,
    compute(context): number {
      // light tanks retain their full camouflage while moving
      if (context.tank.class === TankClass.TANK_CLASS_LIGHT) {
        return context.characteristic("camouflage") as number;
      }

      const c =
        1 +
        (context.characteristic("_camouflage_bonus") as number) +
        (context.characteristic("_camouflage_net_bonus_moving") as number);

      return 100 * context.tank.camouflage_moving * c;
    },
  },

  camouflage_shooting_still: {
    type: CharacteristicType.Number,
    compute({ gun, characteristic }): number {
      return gun.camouflage_loss * (characteristic("camouflage") as number);
    },
  },

  camouflage_shooting_moving: {
    type: CharacteristicType.Number,
    compute({ gun, characteristic }): number {
      return (
        gun.camouflage_loss * (characteristic("camouflage_moving") as number)
      );
    },
  },

  camouflage_on_fire: {
    type: CharacteristicType.Number,
    compute({ tank, characteristic }): number {
      return tank.camouflage_on_fire * (characteristic("camouflage") as number);
    },
  },

  width: {
    type: CharacteristicType.Number,
    compute({ state, turret }) {
      const size = normalizeBoundingBox(
        unionBoundingBox(
          state.model.bounding_box!,
          state.model.turrets[turret.id].bounding_box!,
        ),
      );
      return size.z;
    },
  },

  height: {
    type: CharacteristicType.Number,
    compute({ state, turret }) {
      const size = normalizeBoundingBox(
        unionBoundingBox(
          state.model.bounding_box!,
          state.model.turrets[turret.id].bounding_box!,
        ),
      );
      return size.x;
    },
  },

  length: {
    type: CharacteristicType.Number,
    compute({ state, turret }) {
      const size = normalizeBoundingBox(
        unionBoundingBox(
          state.model.bounding_box!,
          state.model.turrets[turret.id].bounding_box!,
        ),
      );
      return size.y;
    },
  },

  // Compute time only: what the assault shells visualizer is drawn from
  _assault_distances: {
    type: CharacteristicType.NumberList,

    should_render({ gun, shell }) {
      return gun.assault_ranges?.types.includes(shell.type) === true;
    },

    compute({ gun }) {
      return gun.assault_ranges!.ranges.map(({ distance }) => distance);
    },
  },

  _assault_factors: {
    type: CharacteristicType.NumberList,

    should_render({ gun, shell }) {
      return gun.assault_ranges?.types.includes(shell.type) === true;
    },

    compute({ gun }) {
      return gun.assault_ranges!.ranges.map(({ factor }) => factor);
    },
  },
} satisfies Record<string, Characteristic>;
