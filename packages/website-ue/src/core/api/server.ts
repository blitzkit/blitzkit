import type { MetadataAccessor } from "@blitzkit/closed";
import { sluggify, type DeepPartial } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { RemoteStorageComponent } from "@protos/blitz_static_remote_storage_component";
import { merge } from "lodash-es";
import { parse } from "yaml";
import type { Avatar } from "../../protos/avatar";
import type { Tank } from "../../protos/tank";
import type { TankListEntry } from "../../protos/tank_list";
import type { Tanks } from "../../protos/tanks";
import { AbstractAPI } from "./abstract";

if (typeof window !== "undefined") {
  throw new Error("ServerAPI is being evaluated in the browser");
}

const globbedStrings = import.meta.glob("../../../../i18n/strings/*.json", {
  import: "default",
});

interface LocalizationConfig {
  namespaces: string[];
}

export class ServerAPI extends AbstractAPI {
  constructor(private metadata: MetadataAccessor) {
    super();
  }

  protected async _gameStrings(locale: string, prefix: string) {
    const group = this.metadata.group("ClientConfigsEntity");

    if (group.length !== 1) {
      throw new RangeError(
        `Don't know how to handle ${group.length} ClientConfigsEntities`
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
            `${remoteStorage.url}${remoteStorage.relative_path}/${namespace}/${locale}.yaml`
          )
            .then((response) => response.text())
            .then((text) => {
              const strings: Record<string, string> = {};
              const parsed = parse(text) as Record<string, string>;

              for (const key in parsed) {
                strings[key] = parsed[key].replaceAll('\\"', '"');
              }

              return strings;
            })
        );
      }
    } catch (error) {
      console.warn(
        `Failed to fetch config from ${configPath}. Returning empty strings. This will throw an error in production. Error:`,
        error
      );
    }

    const filtered: Record<string, string> = {};

    for (const key in strings) {
      if (key.startsWith(`${prefix}__`)) {
        filtered[key] = strings[key];
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
    const strings = await this.gameStrings("en", "TankEntity");

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

    return { tank, compensation, slug } satisfies Tank;
  }

  async _avatars() {
    const avatars: Avatar[] = [];

    for (const item of this.metadata.group("ProfileAvatarEntity")) {
      avatars.push(await this.avatar(item.name));
    }

    return { avatars };
  }

  async _avatar(id: string) {
    const avatar = this.metadata.item(`ProfileAvatarEntity.${id}`);
    const name = avatar.name;
    const stuff_ui = avatar.StuffUI("UIComponent");
    const profile_avatar = avatar.ProfileAvatar();
    const sellable = avatar.components.sellableComponent
      ? avatar.Sellable()
      : undefined;

    return { name, stuff_ui, profile_avatar, sellable };
  }

  async backgrounds() {
    return this.metadata.group("ProfileBackgroundEntity");
  }

  async background(id: string) {
    return this.metadata.item(`ProfileBackgroundEntity.${id}`);
  }
}
