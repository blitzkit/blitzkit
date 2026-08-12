import {
  BlitzCrewType,
  BlitzModuleType,
  BlitzStrings,
  BlitzTankClass,
  BlitzTankFilterDefinitionCategory,
  CamouflagesXml,
  CamouflagesYaml,
  CombatRolesYaml,
  ConsumablesCommon,
  ConsumableTankCategoryFilterCategory,
  CrewType,
  I18nString,
  MapsYaml,
  ModuleType,
  OptionalDevices,
  OptionalDeviceSlots,
  ProvisionsCommon,
  ShellKind,
  ShellType,
  SquadBattleTypeStylesYaml,
  TankClass,
  TankmenAvatar,
  toUniqueId,
  VehicleDefinitionList,
} from "@blitzkit/core";
import { AbstractVFS } from "@blitzkit/core/src/blitzkit/vfs/abstract";
import { SUPPORTED_LOCALE_BLITZ_MAP } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { parse as parseYaml } from "yaml";
import { BlitzKitAPI } from "../base";

export abstract class ServerBlitzKitAPI0 extends BlitzKitAPI {
  protected vfs: AbstractVFS;

  protected nationSlugDiscriminators = {
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
  protected blitzModuleTypeToBlitzkit: Record<
    keyof BlitzModuleType,
    ModuleType
  > = {
    chassis: ModuleType.MODULE_TYPE_TRACKS,
    engine: ModuleType.MODULE_TYPE_ENGINE,
    gun: ModuleType.MODULE_TYPE_GUN,
    turret: ModuleType.MODULE_TYPE_TURRET,
    vehicle: ModuleType.MODULE_TYPE_VEHICLE,
  };
  protected blitzkitCrewTypeToBlitz: Record<CrewType, BlitzCrewType> = {
    [CrewType.CREW_TYPE_COMMANDER]: "commander",
    [CrewType.CREW_TYPE_DRIVER]: "driver",
    [CrewType.CREW_TYPE_GUNNER]: "gunner",
    [CrewType.CREW_TYPE_LOADER]: "loader",
    [CrewType.CREW_TYPE_RADIOMAN]: "radioman",
  };
  protected blitzCrewTypeToBlitzkit: Record<BlitzCrewType, CrewType> = {
    commander: CrewType.CREW_TYPE_COMMANDER,
    driver: CrewType.CREW_TYPE_DRIVER,
    gunner: CrewType.CREW_TYPE_GUNNER,
    loader: CrewType.CREW_TYPE_LOADER,
    radioman: CrewType.CREW_TYPE_RADIOMAN,
  };
  protected blitzTankClassToBlitzkit: Record<BlitzTankClass, TankClass> = {
    lightTank: TankClass.TANK_CLASS_LIGHT,
    "AT-SPG": TankClass.TANK_CLASS_TANK_DESTROYER,
    heavyTank: TankClass.TANK_CLASS_HEAVY,
    mediumTank: TankClass.TANK_CLASS_MEDIUM,
  };
  protected blitzShellKindToBlitzkit: Record<ShellKind, ShellType> = {
    ARMOR_PIERCING: ShellType.SHELL_TYPE_AP,
    ARMOR_PIERCING_CR: ShellType.SHELL_TYPE_APCR,
    HIGH_EXPLOSIVE: ShellType.SHELL_TYPE_HE,
    HOLLOW_CHARGE: ShellType.SHELL_TYPE_HEAT,
  };
  protected blitzTankFilterDefinitionCategoryToBlitzkit: Record<
    BlitzTankFilterDefinitionCategory,
    ConsumableTankCategoryFilterCategory
  > = {
    clip: ConsumableTankCategoryFilterCategory.CONSUMABLE_TANK_CATEGORY_FILTER_CATEGORY_CLIP,
  };

  protected botPattern = /^.+((tutorial_bot(\d+)?)|(TU))$/;

  protected stringsI18n: Record<string, Record<string, string>> = {};
  protected nationsDir?: string[];
  protected tankStringIdMap: Record<string, number> = {};
  protected consumablesCommon: ConsumablesCommon = {};
  protected provisionsCommon: ProvisionsCommon = {};

  // TODO: suffix with "yaml"s and "xml"s
  protected optionalDevices?: { root: OptionalDevices };
  protected optionalDeviceSlots?: { root: OptionalDeviceSlots };
  protected tankmenAvatar?: { root: TankmenAvatar };
  protected mapsYaml?: MapsYaml;
  protected camouflagesXml?: { root: CamouflagesXml };
  protected camouflagesYaml?: CamouflagesYaml;
  protected squadBattleTypeStyles?: SquadBattleTypeStylesYaml;
  protected gameTypeSelectorStyles?: SquadBattleTypeStylesYaml;
  protected combatRoles?: CombatRolesYaml;
  protected tierEqualizer?: string[][];

  constructor(vfs: AbstractVFS) {
    super();
    this.vfs = vfs;
  }

  async init() {
    console.log("Initializing virtual file system...");
    await this.vfs.init();

    console.log("Fetching game data...");
    this.nationsDir = await this.vfs
      .dir("Data/XML/item_defs/vehicles")
      .then((files) => files.filter((nation) => nation !== "common"));

    this.optionalDevices = await this.vfs.xml<{ root: OptionalDevices }>(
      "Data/XML/item_defs/vehicles/common/optional_devices.xml",
    );
    this.optionalDeviceSlots = await this.vfs.xml<{
      root: OptionalDeviceSlots;
    }>("Data/XML/item_defs/vehicles/common/optional_device_slots.xml");
    this.tankmenAvatar = await this.vfs.xml<{ root: TankmenAvatar }>(
      "Data/XML/item_defs/tankmen/avatar.xml",
    );
    this.mapsYaml = await this.vfs.yaml<MapsYaml>("Data/maps.yaml");
    this.camouflagesXml = await this.vfs.xml<{ root: CamouflagesXml }>(
      "Data/XML/item_defs/vehicles/common/camouflages.xml",
    );
    this.camouflagesYaml = await this.vfs.yaml<CamouflagesYaml>(
      "Data/camouflages.yaml",
    );
    this.squadBattleTypeStyles = await this.vfs.yaml<SquadBattleTypeStylesYaml>(
      `Data/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml`,
    );
    this.gameTypeSelectorStyles =
      await this.vfs.yaml<SquadBattleTypeStylesYaml>(
        `Data/UI/Screens/Lobby/Hangar/GameTypeSelector.yaml`,
      );
    this.combatRoles = await this.vfs.yaml<CombatRolesYaml>(
      `Data/XML/item_defs/vehicles/common/combat_roles.yaml`,
    );
    this.tierEqualizer = await this.vfs.csv(
      // spell:disable-next-line
      `Data/XML/item_defs/vehicles/common/tier_equializer.csv`,
      { delimiter: ";" },
    );

    console.log("Fetching game localizations...");

    if (import.meta.env.DEV) {
      locales.supported = [locales.supported[0]];
    }

    let fetchedLocalizations = 0;
    await Promise.all(
      locales.supported.map(async ({ locale }) => {
        const blitzLocale = SUPPORTED_LOCALE_BLITZ_MAP[locale];
        const cache = await fetch(
          `https://stufficons.wgcdn.co/localizations/${blitzLocale}.yaml`,
        )
          .then((response) => response.text())
          .then((string) => parseYaml(string) as BlitzStrings);
        const preInstalled = await this.vfs.yaml<BlitzStrings>(
          `Data/Strings/${blitzLocale}.yaml`,
        );

        this.stringsI18n[locale] = {
          ...cache,
          ...preInstalled,
        };

        console.log(
          `Fetched localizations for ${locale} (${++fetchedLocalizations}/${locales.supported.length})`,
        );
      }),
    );

    console.log("Fetching consumable and provision data...");

    for (const match of (
      await this.vfs.text(
        `Data/XML/item_defs/vehicles/common/consumables/list.xml`,
      )
    ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
      if (match[1] === "prototypes") continue;

      Object.assign(
        this.consumablesCommon,
        (
          await this.vfs.xml<{ root: ConsumablesCommon }>(
            `Data/XML/item_defs/vehicles/common/consumables/${match[1]}.xml`,
          )
        ).root,
      );
    }

    for (const match of (
      await this.vfs.text(
        `Data/XML/item_defs/vehicles/common/provisions/list.xml`,
      )
    ).matchAll(/<items path="(.+)\.xml"\/>/g)) {
      if (match[1] === "prototypes") continue;

      Object.assign(
        this.provisionsCommon,
        (
          await this.vfs.xml<{ root: ConsumablesCommon }>(
            `Data/XML/item_defs/vehicles/common/provisions/${match[1]}.xml`,
          )
        ).root,
      );
    }

    for (const nation of this.nationsDir!) {
      const tankList = await this.vfs.xml<{ root: VehicleDefinitionList }>(
        `Data/XML/item_defs/vehicles/${nation}/list.xml`,
      );

      for (const tankKey in tankList.root) {
        if (this.botPattern.test(tankKey)) continue;

        const tank = tankList.root[tankKey];
        const tankId = toUniqueId(nation, tank.id);

        this.tankStringIdMap[`${nation}:${tankKey}`] = tankId;
      }
    }

    return this;
  }

  protected getString(name: string) {
    const collection: Record<string, string> = {
      [locales.default]: this.stringsI18n[locales.default][name],
    };

    for (const { locale } of locales.supported) {
      const localizedString = this.stringsI18n[locale][name];

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
}

export function Cache(disableInDev = false) {
  const cache = new WeakMap<object, Map<string, Promise<unknown>>>();

  return function <This, Arguments extends any[], Return>(
    target: (this: This, ...args: Arguments) => Promise<Return>,
    // TODO: evaluate if we need context to make the error trace easier
    // context: ClassMethodDecoratorContext<
    //   This,
    //   (this: This, ...args: Arguments) => Promise<Return>
    // >,
  ) {
    return async function replacementMethod(this: This, ...args: Arguments) {
      const key = args.join("-");
      let thisCache: Map<string, Promise<Return>>;

      if (cache.has(this as object)) {
        thisCache = cache.get(this as object) as Map<string, Promise<Return>>;
      } else {
        thisCache = new Map();
        cache.set(this as object, thisCache);
      }

      const disabled = disableInDev && import.meta.env.DEV;

      if (thisCache.has(key) && !disabled) {
        return thisCache.get(key)!;
      }

      const promise = (async () => {
        try {
          return await target.apply(this, args);
        } catch (error) {
          thisCache!.delete(key);
          throw error;
        }
      })();

      thisCache.set(key, promise);

      return promise;
    };
  };
}
