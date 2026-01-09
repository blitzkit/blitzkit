import type { CatalogItemAccessor } from "@blitzkit/closed";
import type { Strings } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { Tank } from "../../protos/tank";
import type { TankList } from "../../protos/tank_list";
import type { Tanks } from "../../protos/tanks";

export abstract class AbstractAPI {
  abstract tanks(): Promise<Tanks>;

  abstract tankList(): Promise<TankList>;

  abstract _strings(locale: string): Promise<Strings>;
  abstract _gameStrings(
    locale: string,
    prefix: string
  ): Promise<Record<string, string>>;

  private assertLocale(locale: string) {
    const supported = locales.supported.find(
      (supported) => supported.locale === locale
    );

    if (supported === undefined) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    return supported;
  }
  async strings(locale: string) {
    this.assertLocale(locale);
    return await this._strings(locale);
  }
  async gameStrings(locale: string, prefix: string) {
    const supported = this.assertLocale(locale);
    const blitz = supported.blitz ?? supported.locale;
    return await this._gameStrings(blitz, prefix);
  }

  abstract tank(id: string): Promise<Tank>;

  abstract avatars(): Promise<CatalogItemAccessor[]>;
  abstract avatar(id: string): Promise<CatalogItemAccessor>;

  abstract backgrounds(): Promise<CatalogItemAccessor[]>;
  abstract background(id: string): Promise<CatalogItemAccessor>;
}
