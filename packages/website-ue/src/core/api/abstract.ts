import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { Avatar } from "../../protos/avatar";
import type { AvatarList } from "../../protos/avatar_list";
import type { Avatars } from "../../protos/avatars";
import type { Background } from "../../protos/background";
import type { Backgrounds } from "../../protos/backgrounds";
import type { PopularTanks } from "../../protos/popular_tanks";
import type { Tank } from "../../protos/tank";
import type { TankList } from "../../protos/tank_list";
import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  abstract tankList(): Promise<TankList>;
  abstract tank(id: string): Promise<Tank>;

  private _tanksCache: Tanks | undefined;
  protected abstract _tanks(): Promise<Tanks>;
  async tanks() {
    if (this._tanksCache === undefined) {
      this._tanksCache = await this._tanks();
    }

    return this._tanksCache;
  }

  private assertLocale(locale: string) {
    const supported = locales.supported.find(
      (supported) => supported.locale === locale,
    );

    if (supported === undefined) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    return supported;
  }

  private _stringsCache: Record<string, Strings> = {};
  protected abstract _strings(locale: string): Promise<Strings>;
  async strings(locale: string) {
    this.assertLocale(locale);

    if (this._stringsCache[locale] === undefined) {
      this._stringsCache[locale] = await this._strings(locale);
    }

    return this._stringsCache[locale];
  }

  private _gameStringsCache: Record<string, Record<string, string>> = {};
  protected abstract _gameStrings(
    locale: string,
  ): Promise<Record<string, string>>;
  async gameStrings(locale: string) {
    this.assertLocale(locale);

    if (this._gameStringsCache[locale] === undefined) {
      this._gameStringsCache[locale] = await this._gameStrings(locale);
    }

    return this._gameStringsCache[locale];
  }

  private _groupedGameStringsCache: Record<
    string,
    Record<string, Record<string, string>>
  > = {};
  protected abstract _groupedGameStrings(
    locale: string,
    group: string,
  ): Promise<Record<string, string>>;
  async groupedGameStrings(locale: string, group: string, prefix: boolean) {
    this.assertLocale(locale);

    if (this._groupedGameStringsCache[locale] === undefined) {
      this._groupedGameStringsCache[locale] = {};
    }

    if (this._groupedGameStringsCache[locale][group] === undefined) {
      this._groupedGameStringsCache[locale][group] =
        await this._groupedGameStrings(locale, group);
    }

    if (!prefix) return this._groupedGameStringsCache[locale][group];

    const strings: Record<string, string> = {};

    for (const key in this._groupedGameStringsCache[locale][group]) {
      strings[`${group}__${key}`] =
        this._groupedGameStringsCache[locale][group][key];
    }

    return strings;
  }

  private _avatarCache: Record<string, Avatar> = {};
  protected abstract _avatar(id: string): Promise<Avatar>;
  async avatar(id: string) {
    if (this._avatarCache[id] === undefined) {
      this._avatarCache[id] = await this._avatar(id);
    }

    return this._avatarCache[id];
  }

  private _avatarsCache: Avatars | undefined;
  protected abstract _avatars(): Promise<Avatars>;
  async avatars() {
    if (this._avatarsCache === undefined) {
      this._avatarsCache = await this._avatars();
    }

    return this._avatarsCache;
  }

  private _avatarListCache: AvatarList | undefined;
  protected abstract _avatarList(): Promise<AvatarList>;
  async avatarList() {
    if (this._avatarListCache === undefined) {
      this._avatarListCache = await this._avatarList();
    }

    return this._avatarListCache;
  }

  private _backgroundCache: Record<string, Background> = {};
  protected abstract _background(id: string): Promise<Background>;
  async background(id: string) {
    if (this._backgroundCache[id] === undefined) {
      this._backgroundCache[id] = await this._background(id);
    }

    return this._backgroundCache[id];
  }

  private _backgroundsCache: Backgrounds | undefined;
  protected abstract _backgrounds(): Promise<Backgrounds>;
  async backgrounds() {
    if (this._backgroundsCache === undefined) {
      this._backgroundsCache = await this._backgrounds();
    }

    return this._backgroundsCache;
  }

  private _gameStringGroupsCache: string[] | undefined;
  protected abstract _gameStringGroups(): Promise<string[]>;
  async gameStringGroups() {
    if (this._gameStringGroupsCache === undefined) {
      this._gameStringGroupsCache = await this._gameStringGroups();
    }

    return this._gameStringGroupsCache;
  }

  private _popularTanksCache: PopularTanks | undefined;
  protected abstract _popularTanks(): Promise<PopularTanks>;
  async popularTanks() {
    if (this._popularTanksCache === undefined) {
      this._popularTanksCache = await this._popularTanks();
    }

    return this._popularTanksCache;
  }
}

export function Cache(
  discriminator: (...args: unknown[]) => string = () => "",
) {
  const cache = new WeakMap<object, Map<string, unknown>>();

  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const key = discriminator(...args);
      const thisCache = cache.get(this) ?? new Map<string, unknown>();

      if (!cache.has(this)) cache.set(this, thisCache);
      if (thisCache.has(key)) return thisCache.get(key);

      const result = await original.apply(this, args);

      thisCache.set(key, result);

      return result;
    };
  };
}
