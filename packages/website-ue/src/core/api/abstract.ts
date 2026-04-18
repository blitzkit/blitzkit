import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { Avatar } from "@protos/blitzkit/avatar";
import type { AvatarList } from "@protos/blitzkit/avatar_list";
import type { Avatars } from "@protos/blitzkit/avatars";
import type { Background } from "@protos/blitzkit/background";
import type { Backgrounds } from "@protos/blitzkit/backgrounds";
import type { PopularTanks } from "@protos/blitzkit/popular_tanks";
import type { Tank } from "@protos/blitzkit/tank";
import type { TankList } from "@protos/blitzkit/tank_list";
import type { Tanks } from "@protos/blitzkit/tanks";

export abstract class AbstractAPI {
  abstract tankList(): Promise<TankList>;
  abstract tank(id: string): Promise<Tank>;
  abstract tanks(): Promise<Tanks>;
  abstract popularTanks(): Promise<PopularTanks>;

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

  private assertLocale(locale: string) {
    const supported = locales.supported.find(
      (supported) => supported.locale === locale,
    );

    if (supported === undefined) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    return supported;
  }

  @Cache<[string, string, boolean]>((...args) => args.join("-"))
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

export function Cache<Arguments extends unknown[]>(
  discriminator: (...args: Arguments) => string = (...args) => args.join("-"),
) {
  const cache = new WeakMap<object, Map<string, Promise<unknown>>>();

  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = function (...args: Arguments) {
      const key = discriminator(...args);

      let thisCache = cache.get(this);

      if (!thisCache) {
        thisCache = new Map();
        cache.set(this, thisCache);
      }

      if (thisCache.has(key)) {
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
