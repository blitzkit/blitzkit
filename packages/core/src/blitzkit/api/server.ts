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
  SkillDefinitions,
  SquadBattleTypeStylesYaml,
  TankDefinitions,
  TankmenAvatar,
} from "@blitzkit/core";
import { SUPPORTED_LOCALE_BLITZ_MAP } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import { parse as parseYaml } from "yaml";
import { BlitzKitAPI } from "./base";

export class ServerBlitzKitAPI extends BlitzKitAPI {
  private vfs: AbstractVFS;

  private stringsI18n: Record<string, Record<string, string>> = {};

  private nationsDir?: string[];
  consumablesCommon: ConsumablesCommon = {};
  provisionsCommon: ProvisionsCommon = {};

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

    return tankDefinitions;
  }

  async camouflageDefinitions() {
    const camouflageDefinitions = CamouflageDefinitions.create();

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
