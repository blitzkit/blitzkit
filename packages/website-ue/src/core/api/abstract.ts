import type { CatalogItemAccessor } from "@blitzkit/closed";
import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { Avatar } from "../../protos/avatar";
import type { Avatars } from "../../protos/avatars";
import type { Tank } from "../../protos/tank";
import type { TankList } from "../../protos/tank_list";
import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  private _tanksCache: Tanks | undefined;
  protected abstract _tanks(): Promise<Tanks>;
  async tanks() {
    if (this._tanksCache === undefined) {
      this._tanksCache = await this._tanks();
    }

    return this._tanksCache;
  }

  private _tankListCache: TankList | undefined;
  protected abstract _tankList(): Promise<TankList>;
  async tankList() {
    if (this._tankListCache === undefined) {
      this._tankListCache = await this._tankList();
    }

    return this._tankListCache;
  }

  private assertLocale(locale: string) {
    const supported = locales.supported.find(
      (supported) => supported.locale === locale
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

  private _gameStringsCache: Record<
    string,
    Record<string, Record<string, string>>
  > = {};
  protected abstract _gameStrings(
    locale: string,
    prefix: string
  ): Promise<Record<string, string>>;
  async gameStrings(locale: string, prefix: string) {
    this.assertLocale(locale);

    if (this._gameStringsCache[locale] === undefined) {
      this._gameStringsCache[locale] = {};
    }

    if (this._gameStringsCache[locale][prefix] === undefined) {
      this._gameStringsCache[locale][prefix] = await this._gameStrings(
        locale,
        prefix
      );
    }

    return this._gameStringsCache[locale][prefix];
  }

  private _tankCache: Record<string, Tank> = {};
  protected abstract _tank(id: string): Promise<Tank>;
  async tank(id: string) {
    if (this._tankCache[id] === undefined) {
      this._tankCache[id] = await this._tank(id);
    }

    return this._tankCache[id];
  }

  private _avatarsCache: Avatars | undefined;
  protected abstract _avatars(): Promise<Avatars>;
  async avatars() {
    if (this._avatarsCache === undefined) {
      this._avatarsCache = await this._avatars();
    }

    return this._avatarsCache;
  }

  private _avatarCache: Record<string, Avatar> = {};
  protected abstract _avatar(id: string): Promise<Avatar>;
  async avatar(id: string) {
    if (this._avatarCache[id] === undefined) {
      this._avatarCache[id] = await this._avatar(id);
    }

    return this._avatarCache[id];
  }

  abstract backgrounds(): Promise<CatalogItemAccessor[]>;
  abstract background(id: string): Promise<CatalogItemAccessor>;
}
