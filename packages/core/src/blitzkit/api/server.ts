import {
  AbstractVFS,
  BlitzStrings,
  CamouflageDefinitions,
  ConsumableDefinitions,
  ConsumablesCommon,
  EquipmentDefinitions,
  I18nString,
  MapDefinitions,
  ModelDefinitions,
  OptionalDevices,
  OptionalDeviceSlots,
  ProvisionDefinitions,
  ProvisionsCommon,
  SkillDefinitions,
  TankDefinitions,
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

  private optionalDevices?: { root: OptionalDevices };
  private optionalDeviceSlots?: { root: OptionalDeviceSlots };

  constructor(vfs: AbstractVFS) {
    super();
    this.vfs = vfs;
  }

  async init() {
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

    this.nationsDir = await this.vfs
      .dir("Data/XML/item_defs/vehicles")
      .then((files) => files.filter((nation) => nation !== "common"));

    this.optionalDevices = await this.vfs.xml<{ root: OptionalDevices }>(
      "Data/XML/item_defs/vehicles/common/optional_devices.xml",
    );
    this.optionalDeviceSlots = await this.vfs.xml<{
      root: OptionalDeviceSlots;
    }>(`Data/XML/item_defs/vehicles/common/optional_device_slots.xml`);
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
  }

  async camouflageDefinitions() {
    const camouflageDefinitions = CamouflageDefinitions.create();
  }

  async modelDefinitions() {
    const modelDefinitions = ModelDefinitions.create();
  }

  async mapDefinitions() {
    const mapDefinitions = MapDefinitions.create();
  }

  async equipmentDefinitions() {
    const equipmentDefinitions = EquipmentDefinitions.create();
  }

  async consumableDefinitions() {
    const consumableDefinitions = ConsumableDefinitions.create();
  }

  async provisionDefinitions() {
    const provisionDefinitions = ProvisionDefinitions.create();
  }

  async skillDefinitions() {
    const skillDefinitions = SkillDefinitions.create();
  }
}
