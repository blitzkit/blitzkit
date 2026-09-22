import {
  BlitzTankFilterDefinitionCategory,
  Provision,
  ProvisionDefinitions,
} from "@blitzkit/core";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI6 } from "./6_consumables";

export abstract class ServerBlitzKitAPI7 extends ServerBlitzKitAPI6 {
  @Cache()
  async provisions() {
    const provisionDefinitions = ProvisionDefinitions.create();

    Object.entries(this.provisionsCommon).forEach(([, provision]) => {
      const entry = Provision.create({
        id: provision.id,
        exclude: [],
        include: [],
        game_mode_exclusive: "gameModeFilter" in provision,
        name: this.getString(provision.userString),
      });
      provisionDefinitions.provisions[provision.id] = entry;

      const includeRaw = provision.vehicleFilter?.include.vehicle;
      const excludeRaw = provision.vehicleFilter?.exclude?.vehicle;

      if (includeRaw) {
        entry.include = [];

        if ("minLevel" in includeRaw) {
          entry.include.push({
            filter_type: {
              $case: "tiers",
              value: {
                min: includeRaw.minLevel,
                max: includeRaw.maxLevel,
              },
            },
          });
        } else if ("name" in includeRaw) {
          entry.include.push({
            filter_type: {
              $case: "ids",
              value: {
                ids: includeRaw.name.split(/ +/).map((key) => {
                  return this.tankStringIdMap[key];
                }),
              },
            },
          });
        } else throw new SyntaxError("Unhandled include type");

        if (provision.vehicleFilter?.include.nations) {
          entry.include.push({
            filter_type: {
              $case: "nations",
              value: {
                nations: provision.vehicleFilter.include.nations.split(" "),
              },
            },
          });
        }
      }

      if (excludeRaw) {
        entry.exclude = [];

        if ("name" in excludeRaw) {
          entry.exclude!.push({
            filter_type: {
              $case: "ids",
              value: {
                ids: excludeRaw.name
                  .split(/ +/)
                  .map((key) => this.tankStringIdMap[key]),
              },
            },
          });
        } else if ("extendedTags" in excludeRaw) {
          entry.exclude!.push({
            filter_type: {
              $case: "categories",
              value: {
                categories: excludeRaw.extendedTags
                  .split(" ")
                  .map(
                    (item) =>
                      this.blitzTankFilterDefinitionCategoryToBlitzkit[
                        item as BlitzTankFilterDefinitionCategory
                      ],
                  ),
              },
            },
          });
        } else throw new SyntaxError("Unhandled exclude type");

        if (provision.vehicleFilter?.exclude?.nations) {
          entry.exclude!.push({
            filter_type: {
              $case: "nations",
              value: {
                nations: provision.vehicleFilter.exclude.nations.split(" "),
              },
            },
          });
        }
      }

      function applyCanonicalBonuses(map: Record<string, string>) {
        for (const key in map) {
          entry.bonuses[key] = provision.script.bonusValues![map[key]];
        }
      }

      function applyRootBonuses(map: Record<string, string>) {
        for (const key in map) {
          entry.bonuses[key] = provision.script[map[key]];
        }
      }

      function applyAttributeBonuses(map: Record<string, string>) {
        for (const key in map) {
          if (!(map[key] in provision.script.attributes!)) continue;
          entry.bonuses[key] = provision.script.attributes![map[key]];
        }
      }

      switch (provision.script["#text"]) {
        case "Stimulator":
          applyCanonicalBonuses({
            crew_level_increase: "crewLevelIncrease",
          });
          break;

        case "AntiHighExplosive":
          applyCanonicalBonuses({
            anti_high_explosive_factor: "factor",
          });
          break;

        case "Fuel":
          applyCanonicalBonuses({
            engine_power_increase: "enginePowerIncrease",
            turret_rotation_speed_increase: "turretRotationSpeedIncrease",
          });
          break;

        case "SafetySet":
          applyCanonicalBonuses({
            crew_chance_to_hit_factor: "crewChanceToHitFactor",
            repair_speed_increase: "repairSpeedIncrease",
            fire_protection_increase: "fireProtectionIncrease",
          });
          break;

        case "SmallHPStock":
          applyRootBonuses({
            hp_stock_percent: "hpStockPercent",
          });
          break;

        case "GearOil":
          applyCanonicalBonuses({
            forward_speed_limit_bias: "fwdSpeedLimitBias",
            backward_speed_limit_bias: "bkwdSpeedLimitBias",
            engine_power_increase: "enginePowerIncrease",
          });
          break;

        case "GunPowder":
          applyCanonicalBonuses({
            projectile_speed_factor: "projectileSpeedFactor",
          });
          break;

        case "AttributesModifier":
          applyAttributeBonuses({
            firm_ground_passability_increase: "firmGroundPassabilityIncrease",
            medium_ground_passability_increase:
              "mediumGroundPassabilityIncrease",
            repair_speed_factor: "repairSpeedFactor",

            common_damage_factor: "commonDamageFactor",
            gun_reload_factor: "gunReloadFactor",
            pump_gun_reload_factor: "pumpGunReloadFactor",
            gun_aiming_factor: "gunAimingFactor",

            engine_power_factor: "enginePowerFactor",
            speed_limits_factor: "speedLimitsFactor",
            chassis_health_factor: "chassisHealthFactor",
          });
          break;

        case "LifestealHeal":
          applyCanonicalBonuses({
            life_steal_factor: "lifestealFactor",
            life_steal_random_factor: "lifestealRandomFactor",
            kill_heal_factor: "killHealFactor",
            heal_factor: "healFactor",
            heal_random_factor: "healRandomFactor",
          });
          break;

        case "RammingDamage":
          applyCanonicalBonuses({
            ramming_damage_factor: "rammingDamageFactor",
            dealing_ramming_damage_factor: "dealingRammingDamageFactor",
          });
          break;

        case "AllyBuff":
          applyCanonicalBonuses({
            gun_reloading_bonus: "gunReloadingBonus",
            gun_aiming_time_bonus: "gunAimingTimeBonus",
            vision_radius_bonus: "visionRadiusBonus",
          });

          applyRootBonuses({
            range: "range",
            max_bonus_sources: "maxBonusSources",
          });
          break;

        case "Stealth":
          applyRootBonuses({
            sixth_sense_delay: "sixthSenseDelay",
            stop_observing_delay_factor: "stopObservingDelayFactor",
          });
          break;

        case "Revenge":
          applyRootBonuses({
            revenge_damage_percentage: "revengeDamagePercentage",
            effect_duration: "effectDuration",
          });
          break;

        case "ComeBackKit":
          applyRootBonuses({
            time_for_come_back: "timeForComeBack",
            simple_mode: "simpleMode",
          });
          break;

        case "EngineAndSpeedBoost":
          applyCanonicalBonuses({
            engine_power_ability_factor: "enginePowerAbilityFactor",
            speed_limit_ability_bonus: "speedLimitAbilityBonus",
          });
          break;

        case "EnemyReloadTime":
          // bonusValues is empty in the observed data.
          break;

        case "Duplet":
          applyCanonicalBonuses({
            shot_dispersion_angle_factor: "shotDispersionAngleFactor",
            aiming_time_factor: "aimingTimeFactor",
            time_between_shots: "timeBetweenShots",
          });
          break;

        case "Fortune":
          applyCanonicalBonuses({
            increased_damage_chance: "increasedDamageChance",
            increase_damage_factor: "increaseDamageFactor",
          });
          break;

        case "VampiricCurse":
          applyRootBonuses({
            curse_strength: "curseStrength",
            curse_reduction: "curseReduction",
            curse_heal: "curseHeal",
          });
          break;

        case "VampiricDeath":
          applyRootBonuses({
            explode_damage_percent: "explodeDamagePercent",
            range: "range",
          });
          break;

        case "PermanentDamageShield":
          applyRootBonuses({
            damage_reduction_percent: "damageReductionPercent",
          });
          break;

        case "BigBoss":
          applyCanonicalBonuses({
            gun_reload_factor: "gunReloadFactor",
            common_damage_factor: "commonDamageFactor",
            engine_power_factor: "enginePowerFactor",
            speed_limits_factor: "speedLimitsFactor",
            max_health_percent_bonus: "maxHealthPercentBonus",
            max_statics_damage_percent: "maxStaticsDamagePercent",
          });
          break;

        case "VampiricBoost":
          break;

        case "ZombieMark":
          applyAttributeBonuses({
            dealing_ramming_damage_factor: "dealingRammingDamageFactor",
            ramming_damage_factor: "rammingDamageFactor",
            engine_power_factor: "enginePowerFactor",
            speed_limits_factor: "speedLimitsFactor",
            common_damage_factor: "commonDamageFactor",
          });
          break;

        case "HumanMark":
          applyRootBonuses({
            opt_device_ramming_damage_override:
              "optDeviceRammingDamageOverride",
          });

          // `bonusValues.item` is a nested array and therefore isn't
          // appropriate for applyCanonicalBonuses().
          break;

        default:
          console.warn(`Unhandled script type ${provision.script["#text"]}`);
          console.dir(provision.script, { depth: null, colors: true });
      }
    });

    return provisionDefinitions;
  }
}
