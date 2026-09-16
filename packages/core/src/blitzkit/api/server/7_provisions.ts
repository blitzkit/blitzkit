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

      function applyBonuses(map: Record<string, string>) {
        for (const key in map) {
          entry.bonuses[key] = provision.script.bonusValues![map[key]];
        }
      }

      switch (provision.script["#text"]) {
        case "Stimulator":
          applyBonuses({ crew_level_increase: "crewLevelIncrease" });
          break;

        case "AntiHighExplosive":
          applyBonuses({ anti_high_explosive_factor: "factor" });
          break;

        case "Fuel":
          applyBonuses({
            engine_power_increase: "enginePowerIncrease",
            turret_rotation_speed_increase: "turretRotationSpeedIncrease",
          });
          break;

        case "SafetySet":
          applyBonuses({
            crew_chance_to_hit_factor: "crewChanceToHitFactor",
            repair_speed_increase: "repairSpeedIncrease",
            fire_protection_increase: "fireProtectionIncrease",
          });
          break;

        default:
          const message = `Unhandled script type ${provision.script["#text"]}`;

          console.log(message, provision.script);
          throw new Error(message);
      }
    });

    return provisionDefinitions;
  }
}
