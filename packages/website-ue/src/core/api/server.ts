import type { MetadataAccessor } from "@blitzkit/closed";
import { sluggify } from "@blitzkit/core";
import type { RemoteStorageComponent } from "@protos/blitz_static_remote_storage_component";
import { parse } from "yaml";
import type { Tank } from "../../protos/tank";
import type { TankList, TankListEntry } from "../../protos/tank_list";
import type { Tanks } from "../../protos/tanks";
import { AbstractAPI } from "./abstract";

if (typeof window !== "undefined") {
  throw new Error("ServerAPI is being evaluated in the browser");
}

interface LocalizationConfig {
  namespaces: string[];
}

export class ServerAPI extends AbstractAPI {
  constructor(private metadata: MetadataAccessor) {
    super();
  }

  async strings(locale: string) {
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
            `${remoteStorage.url}/${remoteStorage.relative_path}/${namespace}/${locale}.yaml`
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

    return strings;
  }

  async tankList() {
    const group = this.metadata.group("TankEntity");
    const list: TankListEntry[] = [];
    const strings = await this.strings("en");

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

  async tanks() {
    const tankList = await this.tankList();
    const data: Tanks = { tanks: {} };

    for (const { id } of tankList.list) {
      data.tanks[id] = await this._tank(id, tankList);
    }

    return data;
  }

  async _tank(id: string, tankList: TankList) {
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

  async tank(id: string) {
    const tankList = await this.tankList();
    return this._tank(id, tankList);
  }
}
