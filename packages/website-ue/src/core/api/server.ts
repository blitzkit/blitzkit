import type { MetadataAccessor } from "@blitzkit/closed";
import { assertSecret, sluggify } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { RemoteStorageComponent } from "@protos/blitz_static_remote_storage_component";
import type { DeepPartial } from "@protos/blitz_static_reward_currency";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { google } from "googleapis";
import { merge } from "lodash-es";
import { parse } from "yaml";
import type { Avatar } from "../../protos/avatar";
import type { Background } from "../../protos/background";
import type { Tank } from "../../protos/tank";
import type { TankListEntry } from "../../protos/tank_list";
import type { Tanks } from "../../protos/tanks";
import type { PopularTanks } from "../../types/popularTanks";
import { AbstractAPI } from "./abstract";

if (typeof window !== "undefined") {
  throw new Error("ServerAPI is being evaluated in the browser");
}

const globbedStrings = import.meta.glob("../../../../i18n/strings/*.json", {
  import: "default",
});
const tankSlugPattern = /^(\/\w+)?\/tanks\/([a-z0-9-]+)\/$/;

interface LocalizationConfig {
  namespaces: string[];
}

export class ServerAPI extends AbstractAPI {
  constructor(private metadata: MetadataAccessor) {
    super();
  }

  protected async _gameStrings(locale: string) {
    const group = this.metadata.group("ClientConfigsEntity");

    if (group.length !== 1) {
      throw new RangeError(
        `Don't know how to handle ${group.length} ClientConfigsEntities`,
      );
    }

    const clientConfig = this.metadata.item(group[0].id);
    const localizationResources = clientConfig.LocalizationResources();

    if (!localizationResources.remote_storage) {
      throw new Error("Localization resources not found");
    }

    let remoteStorage: RemoteStorageComponent | undefined = undefined;

    for (const candidateId of localizationResources.remote_storage
      .remote_urls) {
      const item = this.metadata.item(candidateId);
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

    const strings: Record<string, string> = {};
    const configPath = `${remoteStorage.url}/${remoteStorage.relative_path}/config.yaml`;

    try {
      const config = await fetch(configPath)
        .then((response) => response.text())
        .then((text) => parse(text) as LocalizationConfig);

      for (const namespace of config.namespaces) {
        Object.assign(
          strings,
          await fetch(
            `${remoteStorage.url}${remoteStorage.relative_path}/${namespace}/${locale}.yaml`,
          )
            .then((response) => response.text())
            .then((text) => {
              const strings: Record<string, string> = {};
              const parsed = parse(text) as Record<string, string>;

              for (const key in parsed) {
                strings[key] = parsed[key].replaceAll('\\"', '"');
              }

              return strings;
            }),
        );
      }
    } catch (error) {
      console.warn(
        `Failed to fetch config from ${configPath}. Returning empty strings. This will throw an error in production. Error:`,
        error,
      );
    }

    return strings;
  }

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

  protected async _strings(locale: string) {
    const localized = (await globbedStrings[
      `../../../../i18n/strings/${locale}.json`
    ]()) as DeepPartial<Strings>;
    const defaults = (await globbedStrings[
      `../../../../i18n/strings/${locales.default}.json`
    ]()) as Strings;
    const strings = merge({}, defaults, localized);

    return strings;
  }

  protected async _tankList() {
    const group = this.metadata.group("TankEntity");
    const list: TankListEntry[] = [];
    const strings = await this.groupedGameStrings("en", "TankEntity", true);

    for (const item of group) {
      const tankCatalog = item.TankCatalog();

      if (!tankCatalog.name) continue;

      const name = strings[tankCatalog.name.value];

      if (!name) continue;

      const id = item.name;
      const slug = sluggify(name);

      list.push({ id, slug });
    }

    return { list };
  }

  protected async _tanks() {
    const tankList = await this.tankList();
    const data: Tanks = { tanks: {} };

    for (const { id } of tankList.list) {
      data.tanks[id] = await this.tank(id);
    }

    return data;
  }

  protected async _tank(id: string) {
    const tankList = await this.tankList();
    const tankListEntry = tankList.list.find((tank) => tank.id === id);

    if (!tankListEntry) {
      throw new Error(`Tank with id ${id} not found`);
    }

    const { slug } = tankListEntry;
    const item = this.metadata.item(`TankEntity.${id}`);
    const tank = item.TankCatalog();
    const compensation = item.Compensation();

    return { id, slug, tank, compensation } satisfies Tank;
  }

  protected async _avatars() {
    const avatars: Avatar[] = [];

    for (const item of this.metadata.group("ProfileAvatarEntity")) {
      avatars.push(await this.avatar(item.name));
    }

    return { avatars };
  }

  protected async _avatar(id: string) {
    const avatar = this.metadata.item(`ProfileAvatarEntity.${id}`);
    const name = avatar.name;
    const stuff_ui = avatar.StuffUI("UIComponent");
    const profile_avatar = avatar.ProfileAvatar();
    const sellable = avatar.components.sellableComponent
      ? avatar.Sellable()
      : undefined;

    return { name, stuff_ui, profile_avatar, sellable };
  }

  protected async _backgrounds() {
    const backgrounds: Background[] = [];

    for (const item of this.metadata.group("ProfileBackgroundEntity")) {
      backgrounds.push(await this.background(item.name));
    }

    return { backgrounds };
  }

  protected async _background(id: string) {
    const background = this.metadata.item(`ProfileBackgroundEntity.${id}`);
    const name = background.name;
    const stuff_ui = background.StuffUI("UIComponent");
    const profile_background = background.ProfileBackground();
    const sellable = background.components.sellableComponent
      ? background.Sellable()
      : undefined;

    return { name, stuff_ui, profile_background, sellable };
  }

  protected async _gameStringGroups() {
    const defaultGameStrings = await this.gameStrings(locales.default);
    const groups = new Set<string>();

    for (const key in defaultGameStrings) {
      const [group] = key.split("__");
      groups.add(group);
    }

    return Array.from(groups.values());
  }

  protected async _popularTanks() {
    if (!existsSync("../../temp/popular.json")) {
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

      const popularTanks: PopularTanks = Object.entries(views)
        .sort(([, a], [, b]) => b - a)
        .map(([id, views]) => ({ id, views }));

      await mkdir("../../temp", { recursive: true });
      await writeFile("../../temp/popular.json", JSON.stringify(popularTanks));

      return popularTanks;
    }

    const data = await readFile("../../temp/popular.json", "utf-8");
    return JSON.parse(data) as PopularTanks;
  }
}
