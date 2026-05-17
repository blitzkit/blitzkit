import { fetchPB } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";
import { Avatars } from "@protos/avatars";
import { TankUpgradePricePresetComponent } from "@protos/blitz_static_tank_upgrade_price_preset_component";
import { Equipment } from "@protos/equipment";
import { PopularTanks } from "@protos/popular_tanks";
import { TankList } from "@protos/tank_list";
import { Tanks } from "@protos/tanks";
import { Tiers } from "@protos/tiers";
import { AbstractAPI, Cache } from "./abstract";

function rejected() {
  return Promise.reject("Not implemented on client");
}

export class ClientAPI extends AbstractAPI {
  get metadata(): never {
    throw new Error("MetadataAccessor is inaccessible on the client");
  }

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
  tankUpgradePreset(name: string) {
    return fetchPB(
      `/api/tanks/presets/upgrade/${name}.pb`,
      TankUpgradePricePresetComponent,
    );
  }

  @Cache()
  tiers() {
    return fetchPB("/api/tiers.pb", Tiers);
  }

  @Cache()
  equipment() {
    return fetchPB("/api/equipment.pb", Equipment);
  }

  @Cache()
  async strings(locale: string) {
    const response = await fetch(`/api/strings/${locale}.json`);
    const json = (await response.json()) as Strings;

    return json;
  }

  @UnimplementedOnClient
  gameStrings() {
    return rejected();
  }

  @Cache()
  protected async _groupedGameStrings(locale: string, group: string) {
    const response = await fetch(`/api/game-strings/${locale}/${group}.json`);
    const json = (await response.json()) as Record<string, string>;

    return json;
  }

  @UnimplementedOnClient
  gameStringGroups() {
    return rejected();
  }

  @UnimplementedOnClient
  avatar() {
    return rejected();
  }

  avatars() {
    return fetchPB("/api/avatars/all.pb", Avatars);
  }

  @UnimplementedOnClient
  avatarList() {
    return rejected();
  }

  @UnimplementedOnClient
  background() {
    return rejected();
  }

  @UnimplementedOnClient
  backgrounds() {
    return rejected();
  }

  @UnimplementedOnClient
  currencyIcon() {
    return rejected();
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
