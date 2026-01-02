import {
  Armor,
  AssaultRanges,
  type BlitzTankClass,
  CamouflageDefinitions,
  Consumable,
  ConsumableDefinitions,
  ConsumableTankCategoryFilterCategory,
  Crew,
  CrewType,
  EquipmentDefinitions,
  EquipmentSlot,
  GameDefinitions,
  GunDefinition,
  I18nString,
  MapDefinitions,
  ModelDefinitions,
  ModuleType,
  Provision,
  ProvisionDefinitions,
  ResearchCost,
  ShellType,
  SkillDefinitions,
  TankClass,
  TankDefinitions,
  TankPrice,
  TankPriceType,
  TankType,
  toUniqueId,
  Unlock,
  Vector3,
} from "@blitzkit/core";
import { SUPPORTED_LOCALE_BLITZ_MAP } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { deburr } from "lodash-es";
import { parse as parsePath } from "path";
import type { Vector3Tuple } from "three";
import { parse as parseYaml } from "yaml";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";
import type { Avatar } from "./skillIcons";
import type { TankParameters } from "./tankIcons";

const nonAlphanumericRegex = /[^a-z0-9]/g;
const multipleDashesRegex = /--+/g;
const trailingDashRegex = /-$/g;
const leadingDashRegex = /^-/g;

const nationSlugDiscriminators = {
  china: "cn",
  european: "eu",
  france: "fr",
  germany: "de",
  japan: "jp",
  other: "ot",
  uk: "gb",
  usa: "us",
  ussr: "ru",
};

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
  clip: ConsumableTankCategoryFilterCategory.CLIP,
};
function vector3TupleToBlitzkit(tuple: Vector3Tuple) {
  return { x: tuple[0], y: tuple[1], z: tuple[2] } satisfies Vector3;
}
const blitzTankClassToBlitzkit: Record<BlitzTankClass, TankClass> = {
  lightTank: TankClass.LIGHT,
  "AT-SPG": TankClass.TANK_DESTROYER,
  heavyTank: TankClass.HEAVY,
  mediumTank: TankClass.MEDIUM,
};
export interface BlitzStrings {
  [key: string]: string;
}
type ShellKind =
  | "ARMOR_PIERCING"
  | "ARMOR_PIERCING_CR"
  | "HIGH_EXPLOSIVE"
  | "HOLLOW_CHARGE";
type ShellDefinitionsList = Record<
  string,
  {
    id: number;
    userString: string;
    icon: string;
    kind: ShellKind;
    caliber: number;
    damage: { armor: number; devices: number };
    normalizationAngle?: number;
    ricochetAngle?: number;
    explosionRadius?: number;
  }
> & {
  icons: Record<string, string>;
};
interface EngineDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
  shared: {
    [key: string]: {
      userString: string;
      level: number;
      fireStartingChance: number;
      weight: number;
      power: number;
    };
  };
}
export interface ChassisDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
}
type VehicleDefinitionArmor = Record<
  string,
  number | { vehicleDamageFactor: 0; "#text": number }
>;
interface UnlocksInner {
  cost: number | string;
  "#text": number;
}
type BlitzModuleType = {
  [key in "vehicle" | "engine" | "chassis" | "turret" | "gun"]:
    | UnlocksInner
    | UnlocksInner[];
};
type UnlocksListing = BlitzModuleType | undefined;
type BlitzCrewType = "commander" | "radioman" | "gunner" | "driver" | "loader";
const blitzCrewTypeToBlitzkit: Record<BlitzCrewType, CrewType> = {
  commander: CrewType.COMMANDER,
  driver: CrewType.DRIVER,
  gunner: CrewType.GUNNER,
  loader: CrewType.LOADER,
  radioman: CrewType.RADIOMAN,
};
const blitzkitCrewTypeToBlitz: Record<CrewType, BlitzCrewType> = {
  [CrewType.COMMANDER]: "commander",
  [CrewType.DRIVER]: "driver",
  [CrewType.GUNNER]: "gunner",
  [CrewType.LOADER]: "loader",
  [CrewType.RADIOMAN]: "radioman",
};
interface VehicleDefinitions {
  invisibility: {
    moving: number;
    still: number;
    firePenalty: number;
  };
  crew: Record<BlitzCrewType, string | string[]>;
  speedLimits: {
    forward: number;
    backward: number;
  };
  consumableSlots: number;
  provisionSlots: number;
  optDevicePreset: string | string[];
  hull: {
    armor: VehicleDefinitionArmor;
    turretPositions: { turret: string };
    turretInitialRotation?: { yaw: 0; pitch: 6.5; roll: 0 };
    maxHealth: number;
    weight: number;
  };
  chassis: {
    [key: string]: {
      unlocks: UnlocksListing;
      weight: number;
      terrainResistance: string;
      rotationSpeed: number;
      userString: string;
      shotDispersionFactors: {
        vehicleMovement: number;
        vehicleRotation: number;
      };
      level: number;
      hullPosition: string;
      armor: {
        leftTrack:
          | number
          | {
              chanceToHitByProjectile: number;
              chanceToHitByExplosion: number;
              "#text": number;
            };
        rightTrack:
          | number
          | {
              chanceToHitByProjectile: number;
              chanceToHitByExplosion: number;
              "#text": number;
            };
      };
    };
  };
  engines: {
    [key: string]: {
      unlocks: UnlocksListing;
    };
  };
  turrets0: {
    [key: string]: {
      unlocks: UnlocksListing;
      rotationSpeed: number;
      weight: number;
      circularVisionRadius: number;
      maxHealth: number;
      armor: VehicleDefinitionArmor;
      userString: string;
      level: number;
      yawLimits: string | string[];
      gunPosition: string | string[];
      models: { undamaged: string };
      hitTester: {
        collisionModel: string;
      };
      guns: {
        [key: string]: {
          unlocks: UnlocksListing;
          armor: VehicleDefinitionArmor & {
            gun?:
              | number
              | {
                  chanceToHitByProjectile: number;
                  chanceToHitByExplosion: number;
                  "#text": number;
                };
          };
          invisibilityFactorAtShot: number | number[];
          reloadTime: number;
          aimingTime?: number;
          shotDispersionRadius: number;
          shotDispersionFactors?: {
            turretRotation: number;
            afterShot: number;
            whileGunDamaged: number;
          };
          maxAmmo: number;
          extraPitchLimits?: {
            front?: string;
            back?: string;
            transition?: number | number[];
          };
          pitchLimits?: string | string[];
          pumpGunMode?: boolean;
          pumpGunReloadTimes?: string;
          clip?: { count: number; rate: number };
          burst?: { count: number; rate: number };
          models: { undamaged: string };
          extras?: {
            trayShell?: {
              kinds: string;
              sectors: Record<
                string,
                { id: number; distance: number; factor: number }[]
              >;
            };
          };
        };
      };
    };
  };
  extras?: {
    armorsStatesController?: {
      state: [
        {
          id: 0;
          armors: string;
          type: "default";
          enabled: true;
          factorsModifiers: "";
          default: "";
        },
        {
          id: 1;
          armors: string;
          type: "default";
          enabled: false;
          factorsModifiers: "";
        }
      ];
    };
  };
}
export interface VehicleDefinitionList {
  [key: string]: {
    id: number;
    userString: string;
    shortUserString?: string;
    description: string;
    price: number | { gold: ""; "#text": number };
    sellPrice?: { gold: ""; "#text": number };
    enrichmentPermanentCost: number;
    notInShop?: boolean;
    tags: string;
    level: number;
    combatRole?: Record<string, string>;
    configurationModes: string;
  };
}
interface TurretDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
}
interface GunDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
  shared: {
    [key: string]: {
      rotationSpeed: number;
      weight: number;
      shotDispersionFactors: {
        turretRotation: number;
        afterShot: number;
        whileGunDamaged: number;
      };
      maxAmmo: number;
      aimingTime: number;
      shotDispersionRadius: number;
      userString: string;
      tags: string;
      level: number;
      pitchLimits: string;
      burst?: { count: number; rate: number };
      clip?: { count: number; rate: number };
      shots: {
        [key: string]: {
          speed: number;
          piercingPower: string;
          maxDistance: number;
        };
      };
    };
  };
}

export interface OptionalDevices {
  [key: string]: {
    id: number;
    userString: string;
    description: string;
    icon: string;
    script: unknown;
    display_params: unknown;
  };
}

interface OptionalDeviceSlots {
  presets: {
    [key: string]: {
      level0: OptionalDeviceSlotRow;
      level1: OptionalDeviceSlotRow;
      level2: OptionalDeviceSlotRow;
    };
  };
}

interface OptionalDeviceSlotRow {
  [key: string]: { device0: string; device1: string };
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

type CamouflagesInclude =
  | {
      nations?: string;
    }
  | {
      vehicle?: { name?: string; minLevel?: number; maxLevel?: number };
    };

interface CamouflagesXML {
  camouflages: Record<
    string,
    {
      id: number;
      userString: string;
      description: string;
      category: string;
      group: string;
      kind: string;
      notInShop: boolean;
      unlockCostCategory?: string;
      vehicleFilter: {
        include?: CamouflagesInclude | CamouflagesInclude[];
      };
      script: string[] | string;
      icon?: string;
      unlockPremium?: string;
      unlockQuest?: string;
      unlockClanLevel?: number;
      unlockShopBundle?: string;
      unlockTankRank?: number;
    }
  >;
}

type CamouflagesYaml = Record<
  string,
  {
    userString?: string;
    shortUserString?: string;
  }
>;

type ConsumablesVehicleFilter =
  | { minLevel: number; maxLevel: number }
  | { name: string }
  | { extendedTags: string };

export interface Maps {
  maps: {
    [key: string]: {
      id: number;
      tags?: string;
      localName: string;
      avaliableInTrainingRoom: boolean; // lol wg typo
      spriteFrame: number;
      supremacyPointsThreshold?: number;
      availableModes: number[];
      shadowMapsAvailable?: boolean;
      assaultRespawnPoints: {
        allies: MapAlly[];
        enemies: MapAlly[];
      };
      levels?: number[];
    };
  };
}

export interface MapAlly {
  respawnNumber: number;
  points: Array<number[]>;
}

interface AvailableNationsYaml {
  available_nations: string[];
}

export interface SquadBattleTypeStyles {
  Prototypes: {
    components: {
      UIDataLocalBindingsComponent: {
        data: [string, string, string][];
      };
    };
  }[];
}

type CombatRolesYaml = Record<
  string,
  {
    id: number;
    default_abilities: string[];
  }
>;

const blitzShellKindToBlitzkit: Record<ShellKind, ShellType> = {
  ARMOR_PIERCING: ShellType.AP,
  ARMOR_PIERCING_CR: ShellType.APCR,
  HIGH_EXPLOSIVE: ShellType.HE,
  HOLLOW_CHARGE: ShellType.HEAT,
};
export const botPattern = /^.+((tutorial_bot(\d+)?)|(TU))$/;
const blitzModuleTypeToBlitzkit: Record<keyof BlitzModuleType, ModuleType> = {
  chassis: ModuleType.TRACKS,
  engine: ModuleType.ENGINE,
  gun: ModuleType.GUN,
  turret: ModuleType.TURRET,
  vehicle: ModuleType.VEHICLE,
};

export async function definitions() {
  console.log("Building definitions...");

  const uploader = new AssetUploader("definitions");
  const gameDefinitions: GameDefinitions = {
    version: (await vfs.text("Data/version.txt")).split(" ")[0],
    nations: (
      await vfs.yaml<AvailableNationsYaml>("Data/available_nations.yaml")
    ).available_nations,
    gameModes: {},
    roles: {},
  };
  const tankDefinitions: TankDefinitions = { tanks: {} };
  const camouflageDefinitions: CamouflageDefinitions = { camouflages: {} };
  const modelDefinitions: ModelDefinitions = { models: {} };
  const mapDefinitions: MapDefinitions = { maps: {} };
  const equipmentDefinitions: EquipmentDefinitions = {
    presets: {},
    equipments: {},
  };
  const consumableDefinitions: ConsumableDefinitions = { consumables: {} };
  const provisionDefinitions: ProvisionDefinitions = { provisions: {} };
  const skillDefinitions: SkillDefinitions = {
    classes: {
      [TankClass.LIGHT]: { skills: [] },
      [TankClass.MEDIUM]: { skills: [] },
      [TankClass.HEAVY]: { skills: [] },
      [TankClass.TANK_DESTROYER]: { skills: [] },
    },
  };
  const nations = vfs
    .dir("Data/XML/item_defs/vehicles")
    .filter((nation) => nation !== "common");
  const tankStringIdMap: Record<string, number> = {};
  const optionalDevices = await vfs.xml<{ root: OptionalDevices }>(
    "Data/XML/item_defs/vehicles/common/optional_devices.xml"
  );
  const stringsI18n: Record<string, Record<string, string>> = {};

  await Promise.all(
    locales.supported.map(async ({ locale }) => {
      const blitzLocale = SUPPORTED_LOCALE_BLITZ_MAP[locale];
      const cache = await fetch(
        `https://stufficons.wgcdn.co/localizations/${blitzLocale}.yaml`
      )
        .then((response) => response.text())
        .then((string) => parseYaml(string) as BlitzStrings);
      const preInstalled = await vfs.yaml<BlitzStrings>(
        `Data/Strings/${blitzLocale}.yaml`
      );

      stringsI18n[locale] = {
        ...cache,
        ...preInstalled,
      };

      console.log(`Loaded strings for ${locale}`);
    })
  );

  function getString(name: string) {
    const collection: Record<string, string> = {
      [locales.default]: stringsI18n[locales.default][name],
    };

    for (const { locale } of locales.supported) {
      const localizedString = stringsI18n[locale][name];

      if (
        localizedString === undefined ||
        localizedString === collection[locales.default]
      ) {
        continue;
      }

      collection[locale] = localizedString;
    }

    return { locales: collection } satisfies I18nString;
  }

  const optionalDeviceSlots = await vfs.xml<{
    root: OptionalDeviceSlots;
  }>(`Data/XML/item_defs/vehicles/common/optional_device_slots.xml`);
  const consumables: ConsumablesCommon = {};
  const provisions: ProvisionsCommon = {};

  for (const match of (
    await vfs.text(`Data/XML/item_defs/vehicles/common/consumables/list.xml`)
  ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
    if (match[1] === "prototypes") continue;

    Object.assign(
      consumables,
      (
        await vfs.xml<{ root: ConsumablesCommon }>(
          `Data/XML/item_defs/vehicles/common/consumables/${match[1]}.xml`
        )
      ).root
    );
  }

  for (const match of (
    await vfs.text(`Data/XML/item_defs/vehicles/common/provisions/list.xml`)
  ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
    if (match[1] === "prototypes") continue;

    Object.assign(
      provisions,
      (
        await vfs.xml<{ root: ConsumablesCommon }>(
          `Data/XML/item_defs/vehicles/common/provisions/${match[1]}.xml`
        )
      ).root
    );
  }

  const avatar = await vfs.xml<{ root: Avatar }>(
    `Data/XML/item_defs/tankmen/avatar.xml`
  );
  const maps = await vfs.yaml<Maps>(`Data/maps.yaml`);
  const tankXps = new Map<number, ResearchCost>();
  const camouflagesXml = await vfs.xml<{ root: CamouflagesXML }>(
    `Data/XML/item_defs/vehicles/common/camouflages.xml`
  );
  const camouflagesYaml = await vfs.yaml<CamouflagesYaml>(
    `Data/camouflages.yaml`
  );
  const camouflagesXmlEntries = Object.entries(camouflagesXml.root.camouflages);
  const squadBattleTypeStyles = await vfs.yaml<SquadBattleTypeStyles>(
    `Data/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml`
  );
  const gameTypeSelectorStyles = await vfs.yaml<SquadBattleTypeStyles>(
    `Data/UI/Screens/Lobby/Hangar/GameTypeSelector.yaml`
  );
  const gameModeNativeNames: Record<string, number> = {};
  const combatRoles = await vfs.yaml<CombatRolesYaml>(
    `Data/XML/item_defs/vehicles/common/combat_roles.yaml`
  );
  const consumableNativeNames: Record<string, number> = {};
  const provisionNativeNames: Record<string, number> = {};

  for (const match of squadBattleTypeStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /"(\d+)" -> "(battleType\/([a-zA-Z]+))"/g
  )) {
    const id = Number(match[1]);
    const name = getString(match[2]);

    gameModeNativeNames[match[3]] = id;
    gameDefinitions.gameModes[id] = {
      name,
    };
  }

  for (const match of gameTypeSelectorStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /eGameMode\.([a-zA-Z]+) -> "~res:\/Gfx\/UI\/Hangar\/GameTypes\/battle-type_([^"]+)"/g
  )) {
    Object.entries(gameModeNativeNames).forEach(([key, value]) => {
      if (key.toLowerCase() === match[2].toLowerCase()) {
        gameModeNativeNames[match[1]] = value;
      }
    });
  }

  camouflagesXmlEntries.forEach(([camoKey, camo]) => {
    const yamlEntry = camouflagesYaml[camoKey];
    const fullName = yamlEntry.userString
      ? getString(yamlEntry.userString)
      : undefined;
    const shortName = yamlEntry.shortUserString
      ? getString(yamlEntry.shortUserString)
      : undefined;
    const resolvedTankName = shortName ?? fullName;
    const resolvedTankNameFull =
      resolvedTankName === fullName ? undefined : fullName;

    camouflageDefinitions.camouflages[camo.id] = {
      id: camo.id,
      name: getString(camo.userString),
      tank_name: resolvedTankName,
      tank_name_full: resolvedTankNameFull,
    };
  });

  const slugRequesters = new Map<string, { id: number; key: string }[]>();
  const idToNation: Record<number, string> = {};

  for (const nation of nations) {
    const tankList = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`
    );

    for (const tankKey in tankList.root) {
      if (botPattern.test(tankKey)) continue;

      const tank = tankList.root[tankKey];
      const tankId = toUniqueId(nation, tank.id);

      const name = (
        (tank.shortUserString ? getString(tank.shortUserString) : undefined) ??
        getString(tank.userString)
      ).locales.en;

      let slug = deburr(name).toLowerCase();
      slug = slug.replaceAll(nonAlphanumericRegex, "-");
      slug = slug.replaceAll(multipleDashesRegex, "-");
      slug = slug.replaceAll(trailingDashRegex, "");
      slug = slug.replaceAll(leadingDashRegex, "");

      idToNation[tankId] = nation;

      if (slugRequesters.has(slug)) {
        slugRequesters.get(slug)!.push({ id: tankId, key: tankKey });
      } else {
        slugRequesters.set(slug, [{ id: tankId, key: tankKey }]);
      }
    }
  }

  const slugs = new Map<number, string>();

  slugRequesters.forEach((requesters, slug) => {
    if (requesters.length === 1) {
      slugs.set(requesters[0].id, slug);
      return;
    }

    console.warn(
      `Multiple tanks share slug ${slug}: ${requesters
        .map(({ key }) => key)
        .join(", ")}`
    );

    if (requesters.length !== 2) {
      throw new Error("Unresolvable number of duplicates :(");
    }

    const nonCanonical = requesters.find(({ key }) => key.endsWith("TUR"));

    if (nonCanonical === undefined) {
      console.log("Using nations to discriminate");
      // both are non-tutorial tanks, will have to discriminate using nation

      requesters.forEach(({ id, key }) => {
        const nation = idToNation[id];
        const discriminator =
          nationSlugDiscriminators[
            nation as keyof typeof nationSlugDiscriminators
          ];

        console.log(`Solution: ${key} -> ${slug}-${discriminator}`);
        slugs.set(id, `${slug}-${discriminator}`);
      });
    } else {
      console.log("Using tutorial bot suffix to discriminate");

      const canonical = requesters.find(({ key }) => !key.endsWith("TUR"));

      if (canonical === undefined) {
        throw new Error(
          "Two tutorial bots share the same slug? The world is truly broken."
        );
      }

      console.log(`Solution: ${canonical.key} -> ${slug}`);
      slugs.set(canonical.id, slug);
      console.log(`Solution: ${nonCanonical.key} -> ${slug}-tur`);
      slugs.set(nonCanonical.id, `${slug}-tur`);
    }
  });

  for (const nation of nations) {
    const tankList = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`
    );
    const turretList = await vfs.xml<{
      root: TurretDefinitionsList;
    }>(`Data/XML/item_defs/vehicles/${nation}/components/turrets.xml`);
    const gunList = await vfs.xml<{
      root: GunDefinitionsList;
    }>(`Data/XML/item_defs/vehicles/${nation}/components/guns.xml`);
    const shellList = await vfs.xml<{
      root: ShellDefinitionsList;
    }>(`Data/XML/item_defs/vehicles/${nation}/components/shells.xml`);
    const enginesList = await vfs.xml<{
      root: EngineDefinitionsList;
    }>(`Data/XML/item_defs/vehicles/${nation}/components/engines.xml`);
    const chassisList = await vfs.xml<{
      root: ChassisDefinitionsList;
    }>(`Data/XML/item_defs/vehicles/${nation}/components/chassis.xml`);

    function resolveUnlocks(unlocks?: BlitzModuleType) {
      if (!unlocks) return [];

      return Object.entries(unlocks)
        .map(([type, list]) =>
          (Array.isArray(list) ? list : [list]).map((item) => {
            const typeTyped = type as keyof BlitzModuleType;
            let rawId: number;

            if (typeTyped === "chassis") {
              rawId = chassisList.root.ids[item["#text"]];
            } else if (typeTyped === "engine") {
              rawId = enginesList.root.ids[item["#text"]];
            } else if (typeTyped === "gun") {
              rawId = gunList.root.ids[item["#text"]];
            } else if (typeTyped === "turret") {
              rawId = turretList.root.ids[item["#text"]];
            } else if (typeTyped === "vehicle") {
              rawId = tankList.root[item["#text"]].id;
            }

            return {
              id: toUniqueId(nation, rawId!),
              type: blitzModuleTypeToBlitzkit[typeTyped],
              cost: {
                type:
                  typeof item.cost === "number"
                    ? "xp"
                    : item.cost.split(":")[0],
                value:
                  typeof item.cost === "number"
                    ? item.cost
                    : Number(item.cost.split(":")[1]),
              },
            } satisfies Unlock;
          })
        )
        .flat();
    }

    for (const tankKey in tankList.root) {
      if (botPattern.test(tankKey)) continue;

      const gunXps = new Map<number, ResearchCost>();
      const turretXps = new Map<number, ResearchCost>();
      const engineXps = new Map<number, ResearchCost>();
      const trackXps = new Map<number, ResearchCost>();
      const tank = tankList.root[tankKey];
      let tankPrice: TankPrice;
      const tankDefinition = await vfs.xml<{ root: VehicleDefinitions }>(
        `Data/XML/item_defs/vehicles/${nation}/${tankKey}.xml`
      );
      const tankParameters = await vfs.yaml<TankParameters>(
        `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`
      );
      const turretOrigin = tankDefinition.root.hull.turretPositions.turret
        .split(" ")
        .map(Number) as Vector3Tuple;
      const tankId = toUniqueId(nation, tank.id);

      const tankTags = tank.tags.split(" ");
      const hullArmor: Armor = { spaced: [], thickness: {} };
      const equipment = tankDefinition.root.optDevicePreset;
      tankStringIdMap[`${nation}:${tankKey}`] = tankId;
      const slug = slugs.get(tankId);

      if (slug === undefined) {
        throw new Error(
          `Could not find slug for ${nation}/${tankKey} (${tankId})`
        );
      }

      if (tank.sellPrice) {
        tankPrice = {
          type: TankPriceType.GOLD,
          value: tank.sellPrice["#text"] * 2,
        };
      } else if (typeof tank.price === "number") {
        tankPrice = {
          type: TankPriceType.CREDITS,
          value: tank.price,
        };
      } else {
        tankPrice = {
          type: TankPriceType.CREDITS,
          value: tank.price["#text"] * 400,
        };
      }

      Object.keys(tankDefinition.root.hull.armor)
        .filter((name) => name.startsWith("armor_"))
        .forEach((name) => {
          const armorIdString = name.match(/armor_(\d+)/)?.[1];

          if (armorIdString === undefined) {
            throw new SyntaxError(`Invalid armor id: ${name}`);
          }

          const armorId = parseInt(armorIdString);
          const armorRaw = tankDefinition.root.hull.armor[name];

          if (typeof armorRaw === "number") {
            hullArmor.thickness[armorId] = armorRaw;
          } else {
            if (!hullArmor.spaced) hullArmor.spaced = [];
            hullArmor.thickness[armorId] = armorRaw["#text"];
            hullArmor.spaced.push(armorId);
          }
        });
      const crew: Crew[] = [];
      const fixedCamouflage = tankTags.includes("eventCamouflage_user");
      const totalUnlocks: UnlocksListing[] = [];

      Object.entries(tankDefinition.root.crew).forEach(([crewKey, value]) => {
        let entry: Crew;
        const index = crew.findIndex(
          ({ type }) => blitzkitCrewTypeToBlitz[type] === crewKey
        );
        if (index === -1) {
          if (crewKey === "#text") return;
          entry = {
            type: blitzCrewTypeToBlitzkit[crewKey as BlitzCrewType],
            count: 0,
            substitute: [],
          };
          crew.push(entry);
        } else {
          entry = crew[index];
        }

        if (typeof value === "string") {
          entry.count++;

          if (value !== "") {
            entry.substitute = value.split(/\n| /).map((member) => {
              return blitzCrewTypeToBlitzkit[member.trim() as BlitzCrewType];
            });
          }
        } else {
          if (entry.count === undefined) {
            entry.count = value.length;
          } else {
            entry.count += value.length;
          }
        }
      });

      const camouflages = camouflagesXmlEntries
        .filter(([, camo]) => {
          if (!camo.vehicleFilter.include) return false;
          if (camo.unlockCostCategory !== "legendary-skins-gold") return false;

          const includeArray = Array.isArray(camo.vehicleFilter.include)
            ? camo.vehicleFilter.include
            : [camo.vehicleFilter.include];

          return includeArray.some((filter) => {
            if ("vehicle" in filter && filter.vehicle?.name) {
              return filter.vehicle.name === `${nation}:${tankKey}`;
            }

            return false;
          });
        })
        .map(([, camo]) => camo.id);

      tankDefinitions.tanks[tankId] = {
        ancestors: [],
        successors: [],
        id: tankId,
        roles: {},
        camouflages: camouflages,
        fixed_camouflage: fixedCamouflage,
        crew,
        weight: tankDefinition.root.hull.weight,
        health: tankDefinition.root.hull.maxHealth,
        speed_forwards: tankDefinition.root.speedLimits.forward,
        speed_backwards: tankDefinition.root.speedLimits.backward,
        equipment_preset:
          typeof equipment === "string" ? equipment : equipment.at(-1)!,
        max_consumables: tankDefinition.root.consumableSlots,
        max_provisions: tankDefinition.root.provisionSlots,
        name:
          (tank.shortUserString
            ? getString(tank.shortUserString)
            : undefined) ?? getString(tank.userString),
        slug,
        nation,
        type: tankTags.includes("collectible")
          ? TankType.COLLECTOR
          : (typeof tank.price === "number" ? false : "gold" in tank.price)
          ? TankType.PREMIUM
          : TankType.RESEARCHABLE,
        tier: tank.level,
        class: blitzTankClassToBlitzkit[tankTags[0] as BlitzTankClass],
        testing: tankTags.includes("testTank"),
        deprecated: tankTags.includes("deprecated"),
        price: tankPrice,
        camouflage_still: tankDefinition.root.invisibility.still,
        camouflage_moving: tankDefinition.root.invisibility.moving,
        camouflage_onFire: tankDefinition.root.invisibility.firePenalty,
        turrets: [],
        engines: [],
        tracks: [],
      };

      if (tank.combatRole) {
        Object.entries(tank.combatRole).forEach(([gameMode, role]) => {
          const id = Object.entries(gameModeNativeNames).find(
            ([key]) => key.toLowerCase() === gameMode.toLowerCase()
          )?.[1];

          if (id === undefined) {
            throw new Error(
              `Unknown game mode in tank ${tankKey}: ${gameMode}`
            );
          }

          tankDefinitions.tanks[tankId].roles[id] = combatRoles[role].id;
        });
      }

      modelDefinitions.models[tankId] = {
        armor: hullArmor,
        turret_origin: vector3TupleToBlitzkit(turretOrigin),
        initial_turret_rotation: tankDefinition.root.hull.turretInitialRotation
          ? {
              yaw: tankDefinition.root.hull.turretInitialRotation.yaw,
              pitch: tankDefinition.root.hull.turretInitialRotation.pitch,
              roll: tankDefinition.root.hull.turretInitialRotation.roll,
            }
          : undefined,
        bounding_box: {
          min: vector3TupleToBlitzkit(tankParameters.collision.hull.bbox.min),
          max: vector3TupleToBlitzkit(tankParameters.collision.hull.bbox.max),
        },
        turrets: {},
        tracks: {},
      };

      Object.keys(tankDefinition.root.chassis).forEach((key) => {
        const track = tankDefinition.root.chassis[key];
        const trackId = toUniqueId(nation, chassisList.root.ids[key]);
        const terrainResistances = track.terrainResistance
          .split(" ")
          .map(Number);
        const trackArmorRaw = track.armor.leftTrack;
        const hullOrigin = track.hullPosition
          .split(" ")
          .map(Number) as Vector3Tuple;

        totalUnlocks.push(track.unlocks);
        tankDefinitions.tanks[tankId].tracks.push({
          id: trackId,
          weight: track.weight,
          name: getString(track.userString),
          traverse_speed: track.rotationSpeed,
          dispersion_move: track.shotDispersionFactors.vehicleMovement,
          dispersion_traverse: track.shotDispersionFactors.vehicleRotation,
          resistance_hard: terrainResistances[0],
          resistance_medium: terrainResistances[1],
          resistance_soft: terrainResistances[2],
          tier: track.level,
          unlocks: resolveUnlocks(track.unlocks),
        });

        modelDefinitions.models[tankId].tracks[trackId] = {
          thickness:
            typeof trackArmorRaw === "number"
              ? trackArmorRaw
              : trackArmorRaw["#text"],
          origin: vector3TupleToBlitzkit(hullOrigin),
        };
      });

      Object.keys(tankDefinition.root.engines).forEach((engineKey) => {
        const engine = tankDefinition.root.engines[engineKey];
        const engineListEntry = enginesList.root.shared[engineKey];
        const engineId = toUniqueId(nation, enginesList.root.ids[engineKey]);

        totalUnlocks.push(engine.unlocks);
        tankDefinitions.tanks[tankId].engines.push({
          id: engineId,
          name: getString(engineListEntry.userString),
          fire_chance: engineListEntry.fireStartingChance,
          tier: engineListEntry.level,
          weight: engineListEntry.weight,
          power: engineListEntry.power,
          unlocks: resolveUnlocks(engine.unlocks),
        });
      });

      Object.keys(tankDefinition.root.turrets0).forEach(
        (turretKey, turretIndex) => {
          const turret = tankDefinition.root.turrets0[turretKey];
          const turretModel = Number(
            parsePath(turret.models.undamaged).name.split("_")[1]
          );
          const turretId = toUniqueId(nation, turretList.root.ids[turretKey]);
          const turretYaw = (
            typeof turret.yawLimits === "string"
              ? turret.yawLimits
              : turret.yawLimits.at(-1)!
          )
            .split(" ")
            .map(Number) as [number, number];
          const gunOrigin = (
            typeof turret.gunPosition === "string"
              ? turret.gunPosition
              : turret.gunPosition[0]
          )
            .split(" ")
            .map(Number) as Vector3Tuple;
          const turretArmor: Armor = { thickness: {}, spaced: [] };

          totalUnlocks.push(turret.unlocks);
          Object.keys(turret.armor)
            .filter((name) => name.startsWith("armor_"))
            .forEach((name) => {
              const armorIdString = name.match(/armor_(\d+)/)?.[1];

              if (armorIdString === undefined) {
                throw new SyntaxError(`Invalid armor id: ${name}`);
              }

              const armorId = parseInt(armorIdString);
              const armorRaw = turret.armor[name];

              if (typeof armorRaw === "number") {
                turretArmor.thickness[armorId] = armorRaw;
              } else {
                if (!turretArmor.spaced) turretArmor.spaced = [];
                turretArmor.thickness[armorId] = armorRaw["#text"];
                turretArmor.spaced.push(armorId);
              }
            });

          turret.userString;

          tankDefinitions.tanks[tankId].turrets.push({
            id: turretId,
            traverse_speed: turret.rotationSpeed,
            name: getString(turret.userString),
            tier: turret.level,
            guns: [],
            health: turret.maxHealth,
            view_range: turret.circularVisionRadius,
            weight: turret.weight,
            unlocks: resolveUnlocks(turret.unlocks),
          });

          modelDefinitions.models[tankId].turrets[turretId] = {
            armor: turretArmor,
            gun_origin: vector3TupleToBlitzkit(gunOrigin),
            model_id: turretModel,
            yaw:
              -turretYaw[0] + turretYaw[1] === 360
                ? undefined
                : { min: turretYaw[0], max: turretYaw[1] },
            guns: {},
            bounding_box: {
              min: vector3TupleToBlitzkit(
                tankParameters.collision[
                  parsePath(turret.hitTester.collisionModel).name.toLowerCase()
                ].bbox.min
              ),
              max: vector3TupleToBlitzkit(
                tankParameters.collision[
                  parsePath(turret.hitTester.collisionModel).name.toLowerCase()
                ].bbox.max
              ),
            },
          };

          Object.keys(turret.guns).forEach((gunKey, gunIndex) => {
            const gun = turret.guns[gunKey];
            const gunId = toUniqueId(nation, gunList.root.ids[gunKey]);
            const gunListEntry = gunList.root.shared[gunKey];
            const pitchLimitsRaw = gun.pitchLimits ?? gunListEntry.pitchLimits;
            const gunPitch = (
              typeof pitchLimitsRaw === "string"
                ? pitchLimitsRaw
                : pitchLimitsRaw.at(-1)!
            )
              .split(" ")
              .map(Number) as [number, number];
            const gunModel = Number(
              parsePath(gun.models.undamaged).name.split("_")[1]
            );
            const gunName = getString(gunListEntry.userString);
            const gunType =
              "clip" in gun
                ? gun.pumpGunMode
                  ? "autoReloader"
                  : "autoLoader"
                : "regular";
            // const gunReload = gun.reloadTime;
            // const shellReloads =
            const gunClipCount = gunType === "regular" ? 1 : gun.clip!.count;
            const front = gun.extraPitchLimits?.front
              ? gun.extraPitchLimits.front.split(" ").map(Number)
              : undefined;
            const back = gun.extraPitchLimits?.back
              ? gun.extraPitchLimits.back.split(" ").map(Number)
              : undefined;
            const transition = gun.extraPitchLimits?.transition
              ? typeof gun.extraPitchLimits.transition === "number"
                ? gun.extraPitchLimits.transition
                : gun.extraPitchLimits.transition.at(-1)!
              : undefined;
            const gunArmor: Armor = { thickness: {}, spaced: [] };
            const shotDispersionFactors =
              gun.shotDispersionFactors ?? gunListEntry.shotDispersionFactors;
            const maskName = `gun_${gunModel.toString().padStart(2, "0")}`;
            const maskEnabled =
              tankParameters.maskSlice?.[maskName]?.enabled ?? false;
            let mask: number | undefined;
            let assault_ranges: AssaultRanges | undefined;

            if (gun.extras?.trayShell) {
              const types = gun.extras.trayShell.kinds
                .split(" ")
                .map((string) => {
                  const trimmed = string.trim();

                  if (trimmed in blitzShellKindToBlitzkit) {
                    return blitzShellKindToBlitzkit[trimmed as ShellKind];
                  }

                  throw new SyntaxError(`Invalid shell kind: ${trimmed}`);
                });
              const sectorNames = Object.keys(gun.extras.trayShell.sectors);

              if (sectorNames.length !== 1 || sectorNames[0] !== "sector") {
                throw new SyntaxError("Invalid tray shell sector");
              }

              const sector = gun.extras.trayShell.sectors.sector;

              assault_ranges = {
                types,
                ranges: sector.map((value) => ({
                  factor: value.factor,
                  distance: value.distance,
                })),
              };
            }

            if (maskEnabled) {
              const maskRaw = tankParameters.maskSlice![maskName]!;
              mask = maskRaw.planePosition[1];
            } else {
              mask = undefined;
            }

            totalUnlocks.push(gun.unlocks);
            Object.keys(gun.armor)
              .filter((name) => name.startsWith("armor_"))
              .forEach((name) => {
                const armorIdString = name.match(/armor_(\d+)/)?.[1];
                if (armorIdString === undefined) {
                  throw new SyntaxError(`Invalid armor id: ${name}`);
                }
                const armorId = parseInt(armorIdString);
                const armorRaw = gun.armor[name];
                if (typeof armorRaw === "number") {
                  gunArmor.thickness[armorId] = armorRaw;
                } else {
                  if (!gunArmor.spaced) gunArmor.spaced = [];
                  gunArmor.thickness[armorId] = armorRaw["#text"];
                  gunArmor.spaced.push(armorId);
                }
              });

            tankDefinitions.tanks[tankId].turrets[turretIndex].guns.push({
              id: gunId,
              weight: gunListEntry.weight,
              rotation_speed: gunListEntry.rotationSpeed,
              name: gunName,
              tier: gunListEntry.level,
              shells: [],
              camouflage_loss:
                typeof gun.invisibilityFactorAtShot === "number"
                  ? gun.invisibilityFactorAtShot
                  : gun.invisibilityFactorAtShot.at(-1)!,
              aim_time: gun.aimingTime ?? gunListEntry.aimingTime,
              dispersion_base:
                gun.shotDispersionRadius ?? gunListEntry.shotDispersionRadius,
              dispersion_damaged: shotDispersionFactors.whileGunDamaged,
              dispersion_shot: shotDispersionFactors.afterShot,
              dispersion_traverse: shotDispersionFactors.turretRotation,
              unlocks: resolveUnlocks(gun.unlocks),
              shell_capacity: gun.maxAmmo ?? gunListEntry.maxAmmo,
              assault_ranges,
              burst:
                gun.burst && gun.burst.count > 1
                  ? {
                      count: gun.burst.count,
                      interval: 60 / gun.burst.rate,
                    }
                  : undefined,
              gun_type:
                gunType === "regular"
                  ? {
                      $case: "regular",
                      value: {
                        reload: gun.reloadTime,
                      },
                    }
                  : gunType === "autoReloader"
                  ? {
                      $case: "auto_reloader",
                      value: {
                        intra_clip: 60 / gun.clip!.rate,
                        shell_count: gunClipCount,
                        shell_reloads: gun
                          .pumpGunReloadTimes!.split(" ")
                          .map(Number),
                      },
                    }
                  : {
                      $case: "auto_loader",
                      value: {
                        intra_clip: 60 / gun.clip!.rate,
                        clip_reload: gun.reloadTime,
                        shell_count: gunClipCount,
                      },
                    },
            } satisfies GunDefinition);

            modelDefinitions.models[tankId].turrets[turretId].guns[gunId] = {
              armor: gunArmor,
              model_id: gunModel,
              mask,
              thickness:
                gun.armor.gun === undefined
                  ? 0
                  : typeof gun.armor.gun === "number"
                  ? gun.armor.gun
                  : gun.armor.gun["#text"],
              pitch: {
                min: gunPitch[0],
                max: gunPitch[1],

                front: front
                  ? {
                      min: front[0],
                      max: front[1],
                      range: front[2],
                    }
                  : undefined,
                back: back
                  ? {
                      min: back[0],
                      max: back[1],
                      range: back[2],
                    }
                  : undefined,
                transition,
              },
            };

            Object.keys(gunListEntry.shots).forEach((shellKey) => {
              const gunShellEntry = gunListEntry.shots[shellKey];
              const shell = shellList.root[shellKey];
              const shellId = toUniqueId(nation, shell.id);
              const shellName = getString(shell.userString);
              const penetrationRaw = gunShellEntry.piercingPower
                .split(" ")
                .filter((penetrationString) => penetrationString !== "")
                .map(Number);

              tankDefinitions.tanks[tankId].turrets[turretIndex].guns[
                gunIndex
              ].shells.push({
                id: shellId,
                name: shellName,
                velocity: gunShellEntry.speed,
                armor_damage: shell.damage.armor,
                module_damage: shell.damage.devices,
                caliber: shell.caliber,
                normalization: shell.normalizationAngle,
                ricochet: shell.ricochetAngle,
                type: blitzShellKindToBlitzkit[shell.kind],
                explosion_radius:
                  shell.kind === "HIGH_EXPLOSIVE"
                    ? shell.explosionRadius ?? 0
                    : undefined,
                icon: shell.icon,
                penetration: {
                  near: penetrationRaw[0],
                  far: penetrationRaw[1],
                },
                range: gunShellEntry.maxDistance,
              });
            });
          });
        }
      );

      totalUnlocks.forEach((unlocks) => {
        if (unlocks === undefined) return;

        Object.entries(unlocks).forEach(([key, value]) => {
          (Array.isArray(value) ? value : [value]).forEach((vehicle) => {
            switch (key as keyof BlitzModuleType) {
              case "vehicle": {
                const tankListEntry = tankList.root[vehicle["#text"]];
                const currentTank = tankDefinitions.tanks[tankId];
                const successorId = toUniqueId(nation, tankListEntry.id);

                tankXps.set(successorId, parseResearchCost(vehicle.cost));

                if (currentTank.successors === undefined) {
                  currentTank.successors = [];
                }
                if (!currentTank.successors!.includes(successorId)) {
                  currentTank.successors!.push(successorId);
                }
                break;
              }

              case "gun": {
                gunXps.set(
                  toUniqueId(nation, gunList.root.ids[vehicle["#text"]]),
                  parseResearchCost(vehicle.cost)
                );
                break;
              }

              case "turret": {
                turretXps.set(
                  toUniqueId(nation, turretList.root.ids[vehicle["#text"]]),
                  parseResearchCost(vehicle.cost)
                );
                break;
              }

              case "engine": {
                engineXps.set(
                  toUniqueId(nation, enginesList.root.ids[vehicle["#text"]]),
                  parseResearchCost(vehicle.cost)
                );
                break;
              }

              case "chassis": {
                trackXps.set(
                  toUniqueId(nation, chassisList.root.ids[vehicle["#text"]]),
                  parseResearchCost(vehicle.cost)
                );
                break;
              }
            }
          });
        });
      });

      Object.values(tankDefinitions.tanks[tankId].turrets).forEach((turret) => {
        turret.research_cost = turretXps.get(turret.id);

        Object.values(turret.guns).forEach((gunRaw) => {
          gunRaw.research_cost = gunXps.get(gunRaw.id);
        });
      });

      Object.values(tankDefinitions.tanks[tankId].engines).forEach((engine) => {
        engine.research_cost = engineXps.get(engine.id);
      });

      Object.values(tankDefinitions.tanks[tankId].tracks).forEach((track) => {
        track.research_cost = trackXps.get(track.id);
      });
    }
  }

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
    }
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
    }
  );

  Object.entries(consumables).forEach(([key, consumable]) => {
    consumableNativeNames[key] = consumable.id;

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
                    ]
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

  Object.entries(provisions).forEach(([key, provision]) => {
    provisionNativeNames[key] = provision.id;

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
                    ]
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

  Object.entries(combatRoles).forEach(([, value]) => {
    gameDefinitions.roles[value.id] = { provisions: [], consumables: [] };

    value.default_abilities.forEach((ability) => {
      if (ability in consumableNativeNames) {
        gameDefinitions.roles[value.id].consumables.push(
          consumableNativeNames[ability]
        );
      } else if (ability in provisionNativeNames) {
        gameDefinitions.roles[value.id].provisions.push(
          provisionNativeNames[ability]
        );
      } else throw new Error(`Unknown ability ${ability}`);
    });
  });

  Object.entries(avatar.root.skillsByClasses).forEach(([tankClass, skills]) => {
    skillDefinitions.classes[
      blitzTankClassToBlitzkit[tankClass as BlitzTankClass]
    ] = {
      skills: skills.split(" "),
    };
  });

  Object.entries(maps.maps).forEach(([key, map]) => {
    mapDefinitions.maps[map.id] = {
      id: map.id,
      name: getString(`#maps:${key}:${map.localName}`),
    };
  });

  await uploader.add({
    content: GameDefinitions.encode(gameDefinitions).finish(),
    path: "definitions/game.pb",
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
