import {
  BlitzTankFilterDefinitionCategory,
  Consumable,
  ConsumableDefinitions,
} from "@blitzkit/core";
import { Cache } from "@blitzkit/core/src/blitzkit/api/server/0";
import { ServerBlitzKitAPI5 } from "@blitzkit/core/src/blitzkit/api/server/5";

export abstract class ServerBlitzKitAPI6 extends ServerBlitzKitAPI5 {
  @Cache()
  async consumableDefinitions() {
    const consumableDefinitions = ConsumableDefinitions.create();

    Object.entries(this.consumablesCommon).forEach(([key, consumable]) => {
      const entry: Consumable = {
        id: consumable.id,
        game_mode_exclusive: "gameModeFilter" in consumable,
        cooldown: consumable.script.cooldown,
        duration: consumable.script.duration,
        name: this.getString(consumable.userString),
        exclude: [],
        include: [],
      };
      consumableDefinitions.consumables[consumable.id] = entry;

      const includeRaw = consumable.vehicleFilter?.include.vehicle;
      const excludeRaw = consumable.vehicleFilter?.exclude?.vehicle;

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

        if (consumable.vehicleFilter?.include.nations) {
          entry.include.push({
            filter_type: {
              $case: "nations",
              value: {
                nations: consumable.vehicleFilter.include.nations.split(" "),
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
                ids: excludeRaw.name.split(/ +/).map((key) => {
                  return this.tankStringIdMap[key];
                }),
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

        if (consumable.vehicleFilter?.exclude?.nations) {
          entry.exclude!.push({
            filter_type: {
              $case: "nations",
              value: {
                nations: consumable.vehicleFilter.exclude.nations.split(" "),
              },
            },
          });
        }
      }
    });

    return consumableDefinitions;
  }
}
