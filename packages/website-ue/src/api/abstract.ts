import type { MetadataAccessor } from "@blitzkit/closed";
import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { Avatar } from "@protos/avatar";
import type { AvatarList } from "@protos/avatar_list";
import type { Avatars } from "@protos/avatars";
import type { Background } from "@protos/background";
import type { Backgrounds } from "@protos/backgrounds";
import type { TankUpgradePricePresetComponent } from "@protos/blitz_static_tank_upgrade_price_preset_component";
import type { Equipment } from "@protos/equipment";
import type { PopularTanks } from "@protos/popular_tanks";
import type { Tank } from "@protos/tank";
import type { TankList } from "@protos/tank_list";
import type { Tanks } from "@protos/tanks";
import type { Tiers } from "@protos/tiers";

export abstract class AbstractAPI {
  abstract metadata: MetadataAccessor;

  abstract tankList(): Promise<TankList>;
  abstract tank(id: string): Promise<Tank>;
  abstract tanks(): Promise<Tanks>;
  abstract popularTanks(): Promise<PopularTanks>;
  abstract tankUpgradePreset(
    name: string,
  ): Promise<TankUpgradePricePresetComponent>;

  abstract tiers(): Promise<Tiers>;
  abstract equipment(): Promise<Equipment>;

  abstract strings(locale: string): Promise<Strings>;
  abstract gameStrings(locale: string): Promise<Record<string, string>>;
  protected abstract _groupedGameStrings(
    locale: string,
    group: string,
  ): Promise<Record<string, string>>;
  abstract gameStringGroups(): Promise<string[]>;

  abstract avatar(id: string): Promise<Avatar>;
  abstract avatars(): Promise<Avatars>;
  abstract avatarList(): Promise<AvatarList>;

  abstract background(id: string): Promise<Background>;
  abstract backgrounds(): Promise<Backgrounds>;

  abstract currencyIcon(id: string): Promise<string>;

  private assertLocale(locale: string) {
    const supported = locales.supported.find(
      (supported) => supported.locale === locale,
    );

    if (supported === undefined) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    return supported;
  }

  @Cache()
  async groupedGameStrings(locale: string, group: string, prefix: boolean) {
    this.assertLocale(locale);

    const gameStrings = await this._groupedGameStrings(locale, group);

    if (!prefix) return gameStrings;

    const strings: Record<string, string> = {};

    for (const key in gameStrings) {
      strings[`${group}__${key}`] = gameStrings[key];
    }

    return strings;
  }
}

export function Cache<Arguments extends unknown[]>(disableInDev = false) {
  const cache = new WeakMap<object, Map<string, Promise<unknown>>>();

  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = function (...args: Arguments) {
      const key = args.join("-");

      let thisCache = cache.get(this);

      if (!thisCache) {
        thisCache = new Map();
        cache.set(this, thisCache);
      }

      const disabled = disableInDev && import.meta.env.DEV;

      if (thisCache.has(key) && !disabled) {
        return thisCache.get(key);
      }

      const promise = (async () => {
        try {
          return await original.apply(this, args);
        } catch (error) {
          thisCache!.delete(key);
          throw error;
        }
      })();

      thisCache.set(key, promise);

      return promise;
    };
  };
}
