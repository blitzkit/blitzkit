import {
  AbstractVFS,
  BlitzStrings,
  CamouflageDefinitions,
  CamouflagesXml,
  CamouflagesYaml,
  CombatRolesYaml,
  ConsumableDefinitions,
  ConsumablesCommon,
  EquipmentDefinitions,
  I18nString,
  MapDefinitions,
  MapsYaml,
  ModelDefinitions,
  OptionalDevices,
  OptionalDeviceSlots,
  ProvisionDefinitions,
  ProvisionsCommon,
  ResearchCost,
  SkillDefinitions,
  sluggify,
  SquadBattleTypeStylesYaml,
  TankDefinitions,
  TankmenAvatar,
  toUniqueId,
  VehicleDefinitionList,
} from "@blitzkit/core";
import { SUPPORTED_LOCALE_BLITZ_MAP } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { parse as parseYaml } from "yaml";
import { BlitzKitAPI } from "./base";

export class ServerBlitzKitAPI extends BlitzKitAPI {
  private vfs: AbstractVFS;

  private nationSlugDiscriminators = {
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

  private stringsI18n: Record<string, Record<string, string>> = {};
  private nationsDir?: string[];
  private tankStringIdMap: Record<string, number> = {};
  private consumablesCommon: ConsumablesCommon = {};
  private provisionsCommon: ProvisionsCommon = {};

  // TODO: suffix with "yaml"s and "xml"s
  private optionalDevices?: { root: OptionalDevices };
  private optionalDeviceSlots?: { root: OptionalDeviceSlots };
  private tankmenAvatar?: { root: TankmenAvatar };
  private mapsYaml?: MapsYaml;
  private camouflagesXml?: { root: CamouflagesXml };
  private camouflagesYaml?: CamouflagesYaml;
  private squadBattleTypeStyles?: SquadBattleTypeStylesYaml;
  private gameTypeSelectorStyles?: SquadBattleTypeStylesYaml;
  private combatRoles?: CombatRolesYaml;
  private tierEqualizer?: string[][];

  constructor(vfs: AbstractVFS) {
    super();
    this.vfs = vfs;
  }

  async init() {
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
      `Data/XML/item_defs/vehicles/common/tier_equializer.csv`,
      { delimiter: ";" },
    );

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
      }),
    );

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
  }

  private getString(name: string) {
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

  async tankDefinitions() {
    const tankDefinitions = TankDefinitions.create();

    const gameModeNativeNames: Record<string, number> = {};
    const squadBattleTypeGameModeNativeNameMatches =
      this.squadBattleTypeStyles!.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
        /"(\d+)" -> "(battleType\/([a-zA-Z]+))"/g,
      );
    const gameTypeGameModeNativeNameMatches =
      this.gameTypeSelectorStyles!.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
        /eGameMode\.([a-zA-Z]+) -> "~res:\/Gfx\/UI\/Hangar\/GameTypes\/battle-type_([^"]+)"/g,
      );

    for (const match of squadBattleTypeGameModeNativeNameMatches) {
      const id = Number(match[1]);
      gameModeNativeNames[match[3]] = id;
    }

    for (const match of gameTypeGameModeNativeNameMatches) {
      Object.entries(gameModeNativeNames).forEach(([key, value]) => {
        if (key.toLowerCase() === match[2].toLowerCase()) {
          gameModeNativeNames[match[1]] = value;
        }
      });
    }

    const botPattern = /^.+((tutorial_bot(\d+)?)|(TU))$/;
    const slugRequesters = new Map<string, { id: number; key: string }[]>();
    const idToNation: Record<number, string> = {};

    for (const nation of this.nationsDir!) {
      const tankList = await this.vfs.xml<{ root: VehicleDefinitionList }>(
        `Data/XML/item_defs/vehicles/${nation}/list.xml`,
      );

      for (const tankKey in tankList.root) {
        if (botPattern.test(tankKey)) continue;

        const tank = tankList.root[tankKey];
        const tankId = toUniqueId(nation, tank.id);

        const name = (
          (tank.shortUserString
            ? this.getString(tank.shortUserString)
            : undefined) ?? this.getString(tank.userString)
        ).locales.en;

        let slug = sluggify(name);

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
          .join(", ")}`,
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
            this.nationSlugDiscriminators[
              nation as keyof typeof this.nationSlugDiscriminators
            ];

          console.log(`Solution: ${key} -> ${slug}-${discriminator}`);
          slugs.set(id, `${slug}-${discriminator}`);
        });
      } else {
        console.log("Using tutorial bot suffix to discriminate");

        const canonical = requesters.find(({ key }) => !key.endsWith("TUR"));

        if (canonical === undefined) {
          throw new Error(
            "Two tutorial bots share the same slug? The world is truly broken.",
          );
        }

        console.log(`Solution: ${canonical.key} -> ${slug}`);
        slugs.set(canonical.id, slug);
        console.log(`Solution: ${nonCanonical.key} -> ${slug}-tur`);
        slugs.set(nonCanonical.id, `${slug}-tur`);
      }
    });

    const tankXps = new Map<number, ResearchCost>();

    return tankDefinitions;
  }

  async camouflageDefinitions() {
    const camouflageDefinitions = CamouflageDefinitions.create();

    for (const camoKey in this.camouflagesXml!.root.camouflages) {
      const camo = this.camouflagesXml!.root.camouflages[camoKey];

      const yamlEntry = this.camouflagesYaml![camoKey];
      const fullName = yamlEntry.userString
        ? this.getString(yamlEntry.userString)
        : undefined;
      const shortName = yamlEntry.shortUserString
        ? this.getString(yamlEntry.shortUserString)
        : undefined;
      const resolvedTankName = shortName ?? fullName;
      const resolvedTankNameFull =
        resolvedTankName === fullName ? undefined : fullName;

      camouflageDefinitions.camouflages[camo.id] = {
        id: camo.id,
        name: this.getString(camo.userString),
        tank_name: resolvedTankName,
        tank_name_full: resolvedTankNameFull,
      };
    }

    return camouflageDefinitions;
  }

  async modelDefinitions() {
    const modelDefinitions = ModelDefinitions.create();

    return modelDefinitions;
  }

  async mapDefinitions() {
    const mapDefinitions = MapDefinitions.create();

    return mapDefinitions;
  }

  async equipmentDefinitions() {
    const equipmentDefinitions = EquipmentDefinitions.create();

    return equipmentDefinitions;
  }

  async consumableDefinitions() {
    const consumableDefinitions = ConsumableDefinitions.create();

    return consumableDefinitions;
  }

  async provisionDefinitions() {
    const provisionDefinitions = ProvisionDefinitions.create();

    return provisionDefinitions;
  }

  async skillDefinitions() {
    const skillDefinitions = SkillDefinitions.create();

    return skillDefinitions;
  }
}
