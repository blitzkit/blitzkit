import {
  blitzkitToBlitzShellKind,
  isExplosive,
  normalizeBoundingBox,
  unionBoundingBox,
} from "@blitzkit/core";
import { ShellType, TankClass } from "@blitzkit/protos";
import { hullTraverseSpeed } from "../tankopedia/hullTraverseSpeed";
import { rawTerrainCoefficient } from "../tankopedia/rawTerrainCoefficient";
import {
  CharacteristicType,
  type Characteristic,
} from "../types/characteristics";

export const characteristics = {
  gun_type: {
    type: CharacteristicType.Enum,

    compute({ gun }) {
      return gun.gun_type!.$case;
    },
  },

  damage: {
    type: CharacteristicType.Number,

    compute({ shell, environment, equalizer, script, gun }) {
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

      if (gun.assault_ranges?.types.includes(shell.type)) {
        const range = gun.assault_ranges.ranges.find(
          ({ distance }) => distance >= environment.distance,
        );

        coefficient *= range?.factor ?? 0;
      }

      return coefficient * shell.armor_damage;
    },
  },

  _reload_coefficient: {
    type: CharacteristicType.Number,

    compute({ script, degressive }) {
      let c0 = 1;

      script("protagonist", "miscAttrs/gunReloadTimeFactor", (effect) => {
        c0 += effect.bonusValues!.percent / 100;
      });

      const c1 = degressive("loader");

      let c2 = 1;

      script("protagonist", "Berserk", (effect) => {
        c2 += effect.bonusValues!.gunReloadSpeedIncrease / 100;
      });

      return (c0 * c1) / c2;
    },
  },

  reload: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case !== "auto_reloader";
    },

    compute({ gun, characteristic }) {
      if (gun.gun_type!.$case === "auto_reloader") return -Infinity;

      const c = characteristic("_reload_coefficient") as number;

      if (gun.gun_type!.$case === "regular") {
        return c * gun.gun_type!.value.reload;
      }

      return c * gun.gun_type!.value.clip_reload;
    },
  },

  reloads: {
    type: CharacteristicType.NumberList,

    should_render({ gun }) {
      return gun.gun_type!.$case === "auto_reloader";
    },

    compute({ gun, characteristic }) {
      if (gun.gun_type!.$case !== "auto_reloader") return [];

      const reloadCoefficient = characteristic("_reload_coefficient") as number;

      return gun.gun_type!.value.shell_reloads.map(
        (reload) => reload * reloadCoefficient,
      );
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

  dpm: {
    type: CharacteristicType.Number,

    compute({ gun, characteristic }) {
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
        const intraClip = characteristic("intra_clip") as number;
        const reloadCoefficient = characteristic(
          "_reload_coefficient",
        ) as number;

        const mostOptimalShell =
          gun.gun_type!.value.shell_reloads.reduce<null | {
            index: number;
            reload: number;
          }>((current, reloadRaw, index) => {
            const reload =
              reloadRaw * reloadCoefficient + (index > 0 ? intraClip : 0);

            if (current === null || reload < current.reload) {
              return { index, reload };
            }
            return current;
          }, null)!;

        dps = alpha / mostOptimalShell?.reload;
      }

      return dps * 60;
    },
  },

  // damage_range: unavailable,

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

  // module_damage_range: unavailable,

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

    compute({ characteristic }) {
      const clipSize = characteristic("clip_size") as number;
      const damage = characteristic("damage") as number;

      return clipSize * damage;
    },
  },

  // TODO: custom type of shell index
  // optimal_shell: {
  //   type: CharacteristicType.Number,

  //   should_render({ gun }) {
  //     return gun.gun_type!.$case === "auto_reloader";
  //   },

  //   compute({ gun, script, degressive }) {
  //     if (gun.gun_type!.$case !== "auto_reloader") return -1;

  //     const autoReloader = gun.gun_type!.value;
  //     const coefficient = reloadCoefficient({ script, degressive, gun });
  //     const intraClip = intraClipCoefficient({ script });

  //     return autoReloader.shell_reloads.reduce(
  //       (bestIndex, reload, index, reloads) => {
  //         const effectiveReload =
  //           reload * coefficient +
  //           (index > 0 ? autoReloader.intra_clip * intraClip : 0);
  //         const bestReload =
  //           reloads[bestIndex] * coefficient +
  //           (bestIndex > 0 ? autoReloader.intra_clip * intraClip : 0);

  //         return effectiveReload < bestReload ? index : bestIndex;
  //       },
  //       0,
  //     );
  //   },
  // },

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

    compute({ shell, environment, equalizer, script }) {
      let c = 1;

      script("protagonist", "CalibratedShells", (effect) => {
        c +=
          effect.piercingFactors![blitzkitToBlitzShellKind[shell.type]] / 100;
      });

      if (environment.equalize) c *= equalizer.penetration;

      return c * shell.penetration!.near;
    },
  },

  penetration_loss_by_distance: {
    type: CharacteristicType.Number,

    compute({ shell, script }) {
      let c = 1;

      script("protagonist", "StaticMiscAttrsModifier", (effect) => {
        c += effect.bonusValues!.piercingPenaltyFactor500m / 100;
      });

      return (
        c *
        100 *
        ((shell.penetration!.near - shell.penetration!.far) /
          shell.penetration!.near)
      );
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

    compute({ shell, script }) {
      let c = 1;

      script("protagonist", "StaticMiscAttrsModifier", (effect) => {
        c += effect.bonusValues!.projectileSpeedFactor / 100;
      });

      script("protagonist", "GunPowder", (effect) => {
        c += effect.bonusValues!.projectileSpeedFactor / 100;
      });

      return c * shell.velocity;
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

  speed_forward: {
    type: CharacteristicType.Number,
    compute({ tank }) {
      return tank.speed_forwards;
    },
  },

  speed_backward: {
    type: CharacteristicType.Number,
    compute({ tank }) {
      return tank.speed_backwards;
    },
  },

  aim_time: {
    type: CharacteristicType.Number,
    compute({ gun, turret, track, degressive, script, characteristic }) {
      /*
      T = (A / C) × ln(√(1 + k² × S)) / (1 − p/100)

      S = (turret rotation speed × turret dispersion factor)²
        + (hull rotation speed × hull dispersion factor)²
        + (min(top speed, 30) × movement dispersion factor)²
      A: the gun’s raw aimingTime—the time for the reticle to shrink by a factor of e ≈ 2.718.
      C: gunner crew factor, accounting for training, provisions, and shared crew roles.
      k: stabilization multiplier; normally 1, reduced by the stabilizer.
      p: signed aiming-drive modifier. For −12%, the displayed time is divided by 1.12, reducing it by approximately 10.7%.
      */

      const topSpeed = characteristic("speed_forward") as number;

      const S =
        (turret.traverse_speed * gun.dispersion_traverse) ** 2 +
        (track.traverse_speed * track.dispersion_traverse) ** 2 +
        (Math.min(topSpeed, 30) * track.dispersion_move) ** 2;

      const A = gun.aim_time;
      const C = degressive("gunner");

      let p = 0;

      script("protagonist", "miscAttrs/gunAimingTimeFactor", (effect) => {
        p = effect.bonusValues!.percent / 100;
      });

      let k = 1;

      script(
        "protagonist",
        "miscAttrs/additiveShotDispersionFactor",
        (effect) => {
          k += effect.bonusValues!.percent / 100;
        },
      );

      const T = ((A / C) * Math.log(Math.sqrt(1 + k ** 2 * S))) / (1 - p / 100);

      return T;
    },
  },

  dispersion: {
    type: CharacteristicType.Number,
    compute({ gun, degressive, script }) {
      let coefficient = 1;

      script("protagonist", "miscAttrs/shotDispersionAngleFactor", (effect) => {
        coefficient += effect.bonusValues!.percent / 100;
      });

      script("protagonist", "FireControlSystem", (effect) => {
        coefficient *= effect.shotDispersionAngleFactor;
      });

      return gun.dispersion_base * degressive("gunner") * coefficient;
    },
  },

  // dispersion_angle: unavailable,

  gun_depression: {
    type: CharacteristicType.Number,
    compute({ state, turret, gun }) {
      const turretModel = state.model.turrets[turret.id];
      const gunModel = turretModel.guns[gun.id];

      return (
        gunModel.pitch!.max + (state.model.initial_turret_rotation?.pitch ?? 0)
      );
    },
  },

  gun_elevation: {
    type: CharacteristicType.Number,
    compute({ state, turret, gun }) {
      const turretModel = state.model.turrets[turret.id];
      const gunModel = turretModel.guns[gun.id];

      return (
        -gunModel.pitch!.min - (state.model.initial_turret_rotation?.pitch ?? 0)
      );
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
      return (
        (tank.weight +
          engine.weight +
          track.weight +
          turret.weight +
          gun.weight) /
        1000
      );
    },
  },

  engine_power: {
    type: CharacteristicType.Number,
    compute({ engine }) {
      return engine.power;
    },
  },

  power_to_weight: {
    type: CharacteristicType.Number,
    compute({ engine, characteristic }) {
      const weight = characteristic("weight");
      if (typeof weight !== "number") {
        throw new Error("Weight characteristic must be numeric");
      }

      return engine.power / weight;
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
    compute({ characteristic }) {
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
    compute({ characteristic }) {
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
    compute({ characteristic }) {
      const raw = characteristic("soft_terrain_coefficient_raw") as number;
      return 100 / raw;
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

  turret_traverse_speed: {
    type: CharacteristicType.Number,
    compute({ turret, progressive }) {
      return turret.traverse_speed * progressive("gunner");
    },
  },

  gun_traverse_speed: {
    type: CharacteristicType.Number,
    compute({ gun, progressive }) {
      return gun.rotation_speed * progressive("gunner");
    },
  },

  health: {
    type: CharacteristicType.Number,
    compute({ tank, turret, environment, equalizer, script }) {
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

      let health = tank.health + turret.health;

      health *= c0 * c1;

      if (environment.equalize) {
        health = 50 * Math.round(health / 50);
      }

      return health;
    },
  },

  fire_chance: {
    type: CharacteristicType.Number,
    compute({ engine }) {
      return engine.fire_chance;
    },
  },

  // fire_rate: unavailable,
  // ramming_resistance: unavailable,

  view_range: {
    type: CharacteristicType.Number,
    compute({ turret, progressive }) {
      return turret.view_range * progressive("commander");
    },
  },

  camouflage: {
    type: CharacteristicType.Number,
    compute({ tank, state }) {
      const camouflageBonus =
        tank.class === TankClass.TANK_CLASS_TANK_DESTROYER
          ? 0.04
          : tank.class === TankClass.TANK_CLASS_HEAVY
            ? 0.03
            : 0.02;

      return (
        tank.camouflage_still * (1 + (state.camouflage ? camouflageBonus : 0))
      );
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
} satisfies Record<string, Characteristic>;
