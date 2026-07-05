import type { MetadataAccessor } from "@blitzkit/closed";
import { assertSecret, sluggify } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { Avatar, DeepPartial } from "@protos/avatar";
import type { Background } from "@protos/background";
import type { RemoteStorageComponent } from "@protos/blitz_static_remote_storage_component";
import { Consumables } from "@protos/consumables";
import { Equipment } from "@protos/equipment";
import type { PopularTanks } from "@protos/popular_tanks";
import { Sets } from "@protos/sets";
import type { Tank } from "@protos/tank";
import type { TankListEntry } from "@protos/tank_list";
import { TankUpgradePresets } from "@protos/tank_upgrade_presets";
import type { Tanks } from "@protos/tanks";
import { TierPrices } from "@protos/tier_prices";
import type { Tiers } from "@protos/tiers";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { google } from "googleapis";
import { merge } from "lodash-es";
import { parse } from "yaml";
import { AbstractAPI, Cache } from "./abstract";

const temp = assertSecret(import.meta.env.TEMP);

if (typeof window !== "undefined") {
  throw new Error("ServerAPI is being evaluated in the browser");
}

const globbedStrings = import.meta.glob("../../../i18n/strings/*.json", {
  import: "default",
});
const tankSlugPattern = /^(\/\w+)?\/tanks\/([a-z0-9-]+)\/$/;

interface LocalizationConfig {
  namespaces: string[];
}

export class ServerAPI extends AbstractAPI {
  constructor(public metadata: MetadataAccessor) {
    super();
  }

  mediaPrefix(path: string) {
    const config = this.resolveClientConfig();
    const metroResources = config.MetroResources();
    const remoteStorage = this.resolveRemoteUrl(
      metroResources.remote_storage!.remote_urls,
    );

    return `${remoteStorage.url}/${remoteStorage.relative_path}${path}`;
  }

  resolveRemoteUrl(remoteUrls: string[]) {
    let remoteStorage: RemoteStorageComponent | undefined = undefined;

    for (const remoteUrl of remoteUrls) {
      const item = this.metadata.item(remoteUrl);
      const candidate = item.RemoteStorage();

      if (
        remoteStorage === undefined ||
        candidate.download_speed_weight > remoteStorage.download_speed_weight
      ) {
        remoteStorage = candidate;
      }
    }

    if (remoteStorage === undefined) {
      throw new Error("No suitable production remote storage found");
    }

    return remoteStorage;
  }

  resolveClientConfig() {
    const group = this.metadata.group("ClientConfigsEntity");

    if (group.length !== 1) {
      throw new RangeError(
        `Don't know how to handle ${group.length} ClientConfigsEntities`,
      );
    }

    return this.metadata.item(group[0].id);
  }

  @Cache()
  async tankList() {
    const group = this.metadata.group("TankEntity");
    const list: TankListEntry[] = [];
    const strings = await this.groupedGameStrings("en", "TankEntity", true);

    for (const item of group) {
      const tankCatalog = item.TankCatalog();

      if (!tankCatalog.name) continue;

      const name = strings[tankCatalog.name.value];

      if (!name) continue;

      const slug = sluggify(name);

      list.push({ id: item.id, slug });
    }

    return { list };
  }

  @Cache()
  async tank(id: string) {
    const tankList = await this.tankList();
    const tankListEntry = tankList.list.find((tank) => tank.id === id);

    if (!tankListEntry) {
      throw new Error(`Tank with id ${id} not found`);
    }

    const { slug } = tankListEntry;
    const item = this.metadata.item(id);
    const tank = item.TankCatalog();
    const compensation = item.Compensation();

    return { id, slug, tank, compensation } satisfies Tank;
  }

  @Cache()
  async tanks() {
    const tankList = await this.tankList();
    const data: Tanks = { tanks: {} };

    for (const { id } of tankList.list) {
      data.tanks[id] = await this.tank(id);
    }

    return data;
  }

  @Cache()
  async popularTanks() {
    if (!existsSync(`${temp}/popular.json`)) {
      const { tanks } = await this.tanks();
      const tanksArray = Object.values(tanks);

      const auth = await google.auth.getClient({
        keyFile: assertSecret(import.meta.env.GOOGLE_APPLICATION_CREDENTIALS),
        scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
      });
      const analytics = google.analyticsdata({ version: "v1beta", auth });
      const report = await analytics.properties.runReport({
        property: `properties/${assertSecret(
          import.meta.env.PUBLIC_GOOGLE_ANALYTICS_PROPERTY_ID,
        )}`,
        requestBody: {
          dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          dimensionFilter: {
            filter: {
              fieldName: "pagePath",
              stringFilter: {
                matchType: "BEGINS_WITH",
                value: "/tanks/",
              },
            },
          },
        },
      });

      const views: Record<string, number> = {};

      if (!report.data.rows) {
        throw new Error("No rows in report");
      }

      for (const row of report.data.rows) {
        if (
          !row.dimensionValues ||
          !row.dimensionValues[0].value ||
          !row.metricValues ||
          !row.metricValues[0].value
        ) {
          continue;
        }

        const matches = row.dimensionValues[0].value.match(tankSlugPattern);

        if (!matches) continue;

        const slug = matches[2];
        const tank = tanksArray.find((tank) => tank.slug === slug);

        if (!tank) continue;

        if (tank.id in views) {
          views[tank.id] += Number(row.metricValues[0].value);
        } else {
          views[tank.id] = Number(row.metricValues[0].value);
        }
      }

      for (const id in tanks) {
        if (!(id in views)) {
          views[id] = 0;
        }
      }

      const popularTanks = {
        tanks: Object.entries(views)
          .sort(([, a], [, b]) => b - a)
          .map(([id, views]) => ({ id, views })),
      } satisfies PopularTanks;

      await mkdir(temp, { recursive: true });
      await writeFile(`${temp}/popular.json`, JSON.stringify(popularTanks));

      return popularTanks;
    }

    const data = await readFile(`${temp}/popular.json`, "utf-8");
    return JSON.parse(data) as PopularTanks;
  }

  @Cache()
  async tankUpgradePresets() {
    const group = this.metadata.group("TankUpgradePricePresetEntity");
    const presets = TankUpgradePresets.create();

    for (const item of group) {
      presets.presets[item.id] = item.TankUpgradePricePreset();
    }

    return presets;
  }

  @Cache()
  async tiers() {
    const group = this.metadata.group("TankTierEntity");
    const tiers: Tiers = { tiers: {} };

    for (const item of group) {
      tiers.tiers[item.id] = item.TankTier();
    }

    return tiers;
  }

  @Cache()
  async equipment() {
    const equipment = Equipment.create();

    for (const item of this.metadata.group("EquipmentPresetEntity")) {
      equipment.presets[item.id] = item.EquipmentPreset();
    }

    for (const item of this.metadata.group("EquipmentPricePresetEntity")) {
      equipment.prices[item.id] = item.EquipmentPricePreset();
    }

    for (const item of this.metadata.group("EquipmentEntity")) {
      equipment.equipments[item.id] = item.BlitzStaticEquipment();
    }

    return equipment;
  }

  @Cache()
  async consumables() {
    const consumables = Consumables.create();

    for (const item of this.metadata.group("ConsumableEntity")) {
      const purchase = item.BlitzStaticPurchase("purchasable");
      const consumable = item.Consumable();
      const compatibility = item.Compatibility();

      consumables.consumables[item.id] = {
        purchase,
        consumable,
        compatibility,
      };
    }

    return consumables;
  }

  @Cache()
  async tierPrices() {
    const tierPrices = TierPrices.create();

    for (const item of this.metadata.group("TierPricesEntity")) {
      tierPrices.prices[item.id] = item.TierPrices();
    }

    return tierPrices;
  }

  @Cache()
  async sets() {
    const sets = Sets.create();

    for (const item of this.metadata.group("TankSetEntity")) {
      sets.sets[item.id] = item.TankSetCatalog();
    }

    return sets;
  }

  @Cache(true)
  async strings(locale: string) {
    const localized = (await globbedStrings[
      `../../../i18n/strings/${locale}.json`
    ]()) as DeepPartial<Strings>;
    const defaults = (await globbedStrings[
      `../../../i18n/strings/${locales.default}.json`
    ]()) as Strings;
    const strings = merge({}, defaults, localized);

    return strings;
  }

  @Cache()
  async gameStrings(locale: string) {
    const clientConfig = this.resolveClientConfig();
    const localizationResources = clientConfig.LocalizationResources();
    const strings: Record<string, string> = {};

    for (const remoteStorageSettings of localizationResources.remote_storages) {
      const remoteStorage = this.resolveRemoteUrl(
        remoteStorageSettings.remote_urls,
      );
      const configPath = `${remoteStorage.url}${remoteStorage.relative_path}/config.yaml`;
      const config = await fetch(configPath)
        .then((response) => response.text())
        .then((text) => parse(text) as LocalizationConfig);

      for (const namespace of config.namespaces) {
        const url = `${remoteStorage.url}${remoteStorage.relative_path}/${namespace}/${locale}.yaml`;
        const response = await fetch(url);
        const text = await response.text();
        const namespaceStrings: Record<string, string> = {};
        const parsed = parse(text) as Record<string, string>;

        for (const key in parsed) {
          strings[key] = parsed[key].replaceAll('\\"', '"');
        }

        Object.assign(strings, namespaceStrings);
      }
    }

    return strings;
  }

  @Cache()
  protected async _groupedGameStrings(locale: string, group: string) {
    const strings = await this.gameStrings(locale);
    const filtered: Record<string, string> = {};

    for (const key in strings) {
      if (key.startsWith(`${group}__`)) {
        const trimmed = key.substring(group.length + 2);
        filtered[trimmed] = strings[key];
      }
    }

    return filtered;
  }

  @Cache()
  async gameStringGroups() {
    const defaultGameStrings = await this.gameStrings(locales.default);
    const groups = new Set<string>();

    for (const key in defaultGameStrings) {
      const [group] = key.split("__");
      groups.add(group);
    }

    return Array.from(groups.values());
  }

  @Cache()
  async avatar(id: string) {
    const avatar = this.metadata.item(id);
    const stuff_ui = avatar.StuffUI("UIComponent");
    const profile_avatar = avatar.ProfileAvatar();
    const sellable = avatar.components.sellableComponent
      ? avatar.Sellable()
      : undefined;

    return { id, stuff_ui, profile_avatar, sellable };
  }

  @Cache()
  async avatars() {
    const avatars: Avatar[] = [];

    for (const item of this.metadata.group("ProfileAvatarEntity")) {
      avatars.push(await this.avatar(item.id));
    }

    return { avatars };
  }

  @Cache()
  async avatarList() {
    const avatars = await this.avatars();
    const list = avatars.avatars.map((avatar) => avatar.id);

    return { list };
  }

  @Cache()
  async background(id: string) {
    const background = this.metadata.item(id);
    const stuff_ui = background.StuffUI("UIComponent");
    const profile_background = background.ProfileBackground();
    const sellable = background.components.sellableComponent
      ? background.Sellable()
      : undefined;

    return { id, stuff_ui, profile_background, sellable };
  }

  @Cache()
  async backgrounds() {
    const backgrounds: Background[] = [];

    for (const item of this.metadata.group("ProfileBackgroundEntity")) {
      backgrounds.push(await this.background(item.id));
    }

    return { backgrounds };
  }

  @Cache()
  async currencyIcon(id: string) {
    const item = this.metadata.item(id);
    const stuffUI = item.StuffUI("UIComponent");
    return this.mediaPrefix(stuffUI.icon!.value);
  }

  @Cache()
  async stuffIcon(id: string) {
    const item = this.metadata.item(id);
    console.log(id);
    const stuffUI = item.StuffUI("UIComponent");
    return this.mediaPrefix(stuffUI.icon!.value);
  }
}
