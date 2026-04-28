import { fetchPB } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";
import { Avatars } from "@protos/blitzkit/avatars";
import { PopularTanks } from "@protos/blitzkit/popular_tanks";
import { TankList } from "@protos/blitzkit/tank_list";
import { Tanks } from "@protos/blitzkit/tanks";
import { Tiers } from "@protos/blitzkit/tiers";
import { AbstractAPI, Cache } from "./abstract";

const rejected = Promise.reject("Not implemented on client");

export class ClientAPI extends AbstractAPI {
  @Cache()
  tankList() {
    return fetchPB("/api/tanks/list.pb", TankList);
  }

  @Cache()
  async tank(id: string) {
    const tanks = await this.tanks();
    return tanks.tanks[id];
  }

  @Cache()
  tanks() {
    return fetchPB("/api/tanks/all.pb", Tanks);
  }

  @Cache()
  popularTanks() {
    return fetchPB("/api/tanks/popular.pb", PopularTanks);
  }

  @Cache()
  tiers() {
    return fetchPB("/api/tiers.pb", Tiers);
  }

  @Cache()
  async strings(locale: string) {
    const response = await fetch(`/api/strings/${locale}.json`);
    const json = (await response.json()) as Strings;

    return json;
  }

  @UnimplementedOnClient
  gameStrings() {
    return rejected;
  }

  @Cache()
  protected async _groupedGameStrings(locale: string, group: string) {
    const response = await fetch(`/api/game-strings/${locale}/${group}.json`);
    const json = (await response.json()) as Record<string, string>;

    return json;
  }

  @UnimplementedOnClient
  gameStringGroups() {
    return rejected;
  }

  @UnimplementedOnClient
  avatar() {
    return rejected;
  }

  avatars() {
    return fetchPB("/api/avatars/all.pb", Avatars);
  }

  @UnimplementedOnClient
  avatarList() {
    return rejected;
  }

  @UnimplementedOnClient
  background() {
    return rejected;
  }

  @UnimplementedOnClient
  backgrounds() {
    return rejected;
  }
}

function UnimplementedOnClient(
  _target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  descriptor.value = function () {
    throw new Error(`${propertyKey} is not implemented on the client`);
  };
}
