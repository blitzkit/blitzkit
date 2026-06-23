import { fetchPB } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";
import { Avatars } from "@protos/avatars";
import { Consumables } from "@protos/consumables";
import { Equipment } from "@protos/equipment";
import { PopularTanks } from "@protos/popular_tanks";
import { Sets } from "@protos/sets";
import { TankList } from "@protos/tank_list";
import { TankUpgradePresets } from "@protos/tank_upgrade_presets";
import { Tanks } from "@protos/tanks";
import { TierPrices } from "@protos/tier_prices";
import { Tiers } from "@protos/tiers";
import { AbstractAPI, Cache } from "./abstract";

function rejected() {
  return Promise.reject("Not implemented on client");
}

export class ClientAPI extends AbstractAPI {
  get metadata(): never {
    throw new Error("MetadataAccessor is inaccessible on the client");
  }

  @UnimplementedOnClient()
  mediaPrefix(): never {
    throw rejected();
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
  tankUpgradePresets() {
    return fetchPB(`/api/tanks/upgrades.pb`, TankUpgradePresets);
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
  consumables() {
    return fetchPB("/api/consumables.pb", Consumables);
  }

  @Cache()
  tierPrices() {
    return fetchPB("/api/tier-prices.pb", TierPrices);
  }

  @Cache()
  sets() {
    return fetchPB("/api/sets.pb", Sets);
  }

  @Cache(true)
  async strings(locale: string) {
    const response = await fetch(`/api/strings/${locale}.json`);
    const json = (await response.json()) as Strings;

    return json;
  }

  @UnimplementedOnClient()
  gameStrings() {
    return rejected();
  }

  @Cache()
  protected async _groupedGameStrings(locale: string, group: string) {
    const response = await fetch(`/api/game-strings/${locale}/${group}.json`);
    const json = (await response.json()) as Record<string, string>;

    return json;
  }

  @UnimplementedOnClient()
  gameStringGroups() {
    return rejected();
  }

  @UnimplementedOnClient()
  avatar() {
    return rejected();
  }

  avatars() {
    return fetchPB("/api/avatars/all.pb", Avatars);
  }

  @UnimplementedOnClient()
  avatarList() {
    return rejected();
  }

  @UnimplementedOnClient()
  background() {
    return rejected();
  }

  @UnimplementedOnClient()
  backgrounds() {
    return rejected();
  }

  @UnimplementedOnClient()
  currencyIcon() {
    return rejected();
  }

  @UnimplementedOnClient()
  stuffIcon() {
    return rejected();
  }
}

export function UnimplementedOnClient() {
  return function <This, Arguments extends any[], Return>(
    _target: (this: This, ...args: Arguments) => Promise<Return>,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Arguments) => Promise<Return>
    >,
  ) {
    return function () {
      throw new Error(
        `${String(context.name)} is not implemented on the client`,
      );
    };
  };
}
