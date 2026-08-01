import {
  type BlitzTankClass,
  CamouflageDefinitions,
  Consumable,
  ConsumableDefinitions,
  ConsumableTankCategoryFilterCategory,
  CrewType,
  EquipmentDefinitions,
  EquipmentSlot,
  MapDefinitions,
  ModelDefinitions,
  Provision,
  ProvisionDefinitions,
  ResearchCost,
  ShellType,
  SkillDefinitions,
  TankClass,
  TankDefinitions,
  Vector3,
} from "@blitzkit/core";
import type { Vector3Tuple } from "three";

function parseResearchCost(raw: number | string) {
  if (typeof raw === "number") {
    return {
      research_cost_type: { $case: "xp", value: raw },
    } satisfies ResearchCost;
  } else {
    return {
      research_cost_type: {
        $case: "seasonal_tokens",
        value: {
          season: Number(/prx_season_(\d+):\d+/.exec(raw)![1]),
          tokens: Number(/prx_season_\d+:(\d+)/.exec(raw)![1]),
        },
      },
    } satisfies ResearchCost;
  }
}

type BlitzTankFilterDefinitionCategory = "clip";
const blitzTankFilterDefinitionCategoryToBlitzkit: Record<
  BlitzTankFilterDefinitionCategory,
  ConsumableTankCategoryFilterCategory
> = {
  clip: ConsumableTankCategoryFilterCategory.CONSUMABLE_TANK_CATEGORY_FILTER_CATEGORY_CLIP,
};
function vector3TupleToBlitzkit(tuple: Vector3Tuple) {
  return { x: tuple[0], y: tuple[1], z: tuple[2] } satisfies Vector3;
}
const blitzTankClassToBlitzkit: Record<BlitzTankClass, TankClass> = {
  lightTank: TankClass.TANK_CLASS_LIGHT,
  "AT-SPG": TankClass.TANK_CLASS_TANK_DESTROYER,
  heavyTank: TankClass.TANK_CLASS_HEAVY,
  mediumTank: TankClass.TANK_CLASS_MEDIUM,
};
export interface BlitzStrings {
  [key: string]: string;
}



export interface ConsumablesCommon {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    category: string;
    tags: string;
    vehicleFilter?: {
      include: { vehicle: ConsumablesVehicleFilter; nations?: string };
      exclude?: { vehicle: ConsumablesVehicleFilter; nations?: string };
    };
    script: {
      "#text": string;
      automatic?: boolean;
      cooldown: number;
      duration?: number;
      shotEffect?: string;
      bonusValues?: { [key: string]: number };
    } & Record<string, string>;
  };
}
export interface ProvisionsCommon {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    category: string;
    tags: string;
    vehicleFilter?: {
      include: { vehicle: ConsumablesVehicleFilter; nations?: string };
      exclude?: { vehicle: ConsumablesVehicleFilter; nations?: string };
    };
    script: {
      "#text": string;
      automatic?: boolean;
      shotEffect?: string;
      bonusValues?: { [key: string]: number };
    } & Record<string, string>;
  };
}

type ConsumablesVehicleFilter =
  | { minLevel: number; maxLevel: number }
  | { name: string }
  | { extendedTags: string };

type CombatRolesYaml = Record<
  string,
  {
    id: number;
    default_abilities: string[];
  }
>;

const blitzShellKindToBlitzkit: Record<ShellKind, ShellType> = {
  ARMOR_PIERCING: ShellType.SHELL_TYPE_AP,
  ARMOR_PIERCING_CR: ShellType.SHELL_TYPE_APCR,
  HIGH_EXPLOSIVE: ShellType.SHELL_TYPE_HE,
  HOLLOW_CHARGE: ShellType.SHELL_TYPE_HEAT,
};

export async function definitions() {
  Object.values(tankDefinitions.tanks).forEach((tank) => {
    tank.research_cost = tankXps.get(tank.id);
  });

  Object.values(tankDefinitions.tanks).forEach((tank) => {
    tank.successors?.forEach((predecessorId) => {
      if (!tankDefinitions.tanks[predecessorId].ancestors?.includes(tank.id)) {
        tankDefinitions.tanks[predecessorId].ancestors?.push(tank.id);
      }
    });
  });

  Object.entries(optionalDevices.root).forEach(
    ([optionalDeviceKey, optionalDeviceEntry]) => {
      if (optionalDeviceKey === "nextAvailableId") return;

      equipmentDefinitions.equipments[optionalDeviceEntry.id] = {
        name: getString(optionalDeviceEntry.userString),
        description: getString(optionalDeviceEntry.description),
      };
    },
  );

  Object.entries(optionalDeviceSlots.root.presets).forEach(
    ([optionalDeviceSlotKey, optionalDeviceSlotEntry]) => {
      if (optionalDeviceSlotKey === "emptyPreset") return;

      equipmentDefinitions.presets[optionalDeviceSlotKey] = {
        slots: Object.values(optionalDeviceSlotEntry)
          .map((level) => {
            return Object.values(level).map((options) => {
              return {
                left: optionalDevices.root[options.device0].id,
                right: optionalDevices.root[options.device1].id,
              } satisfies EquipmentSlot;
            });
          })
          .flat(),
      };
    },
  );

  Object.entries(consumablesCommon).forEach(([key, consumable]) => {
    const entry: Consumable = {
      id: consumable.id,
      game_mode_exclusive: "gameModeFilter" in consumable,
      cooldown: consumable.script.cooldown,
      duration: consumable.script.duration,
      name: getString(consumable.userString),
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
                return tankStringIdMap[key];
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
                return tankStringIdMap[key];
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
                    blitzTankFilterDefinitionCategoryToBlitzkit[
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

  Object.entries(provisionsCommon).forEach(([key, provision]) => {
    const entry: Provision = {
      id: provision.id,
      exclude: [],
      include: [],
      game_mode_exclusive: "gameModeFilter" in provision,
      name: getString(provision.userString),
    };
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
                return tankStringIdMap[key];
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
                .map((key) => tankStringIdMap[key]),
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
                    blitzTankFilterDefinitionCategoryToBlitzkit[
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

    if (provision.script.bonusValues?.crewLevelIncrease !== undefined) {
      provisionDefinitions.provisions[provision.id].crew =
        provision.script.bonusValues?.crewLevelIncrease;
    }
  });

  Object.entries(tankmenAvatar.root.skillsByClasses).forEach(
    ([tankClass, skills]) => {
      skillDefinitions.classes[
        blitzTankClassToBlitzkit[tankClass as BlitzTankClass]
      ] = {
        skills: skills.split(" "),
      };
    },
  );

  Object.entries(mapsYaml.maps).forEach(([key, map]) => {
    mapDefinitions.maps[map.id] = {
      id: map.id,
      name: getString(`#maps:${key}:${map.localName}`),
    };
  });

  await uploader.add({
    content: TankDefinitions.encode(tankDefinitions).finish(),
    path: "definitions/tanks.pb",
  });
  await uploader.add({
    content: ModelDefinitions.encode(modelDefinitions).finish(),
    path: "definitions/models.pb",
  });
  await uploader.add({
    content: EquipmentDefinitions.encode(equipmentDefinitions).finish(),
    path: "definitions/equipment.pb",
  });
  await uploader.add({
    content: ConsumableDefinitions.encode(consumableDefinitions).finish(),
    path: "definitions/consumables.pb",
  });
  await uploader.add({
    content: ProvisionDefinitions.encode(provisionDefinitions).finish(),
    path: "definitions/provisions.pb",
  });
  await uploader.add({
    content: SkillDefinitions.encode(skillDefinitions).finish(),
    path: "definitions/skills.pb",
  });
  await uploader.add({
    content: MapDefinitions.encode(mapDefinitions).finish(),
    path: "definitions/maps.pb",
  });
  await uploader.add({
    content: CamouflageDefinitions.encode(camouflageDefinitions).finish(),
    path: "definitions/camouflages.pb",
  });

  await uploader.flush();
}
