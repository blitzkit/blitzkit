import { fetchPB } from "@blitzkit/core";
import type { Strings } from "@blitzkit/i18n";
import { Avatars } from "../../protos/avatars";
import { AbstractAPI } from "./abstract";

export class ClientAPI extends AbstractAPI {
  protected _avatars() {
    return fetchPB("/api/avatars/all.pb", Avatars);
  }

  protected _gameStrings(): Promise<Record<string, string>> {
    throw new Error("Cannot fetch full game strings on client");
  }

  protected async _groupedGameStrings(
    locale: string,
    group: string,
    prefix: boolean
  ) {
    const response = await fetch(`/api/game-strings/${locale}/${group}.json`);
    const json = (await response.json()) as Record<string, string>;

    if (!prefix) return json;

    const strings: Record<string, string> = {};

    for (const key in json) {
      strings[`${group}__${key}`] = json[key];
    }

    return strings;
  }

  protected async _strings(locale: string) {
    const response = await fetch(`/api/strings/${locale}.json`);
    const json = (await response.json()) as Strings;

    return json;
  }
}
