import {
  DescriptionDefinitions,
  DescriptionSource,
  type EncyclopediaGame,
  type EncyclopediaVehicle,
  fetchEncyclopedia,
  type I18nString,
} from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import { matchDescription } from "../../matchDescription";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI10 } from "./10_galleryDefinitions";

// the rest of our locales are rejected by the encyclopedia
const WG_API_LANGUAGES = [
  "en",
  "ru",
  "pl",
  "de",
  "fr",
  "es",
  "zh-cn",
  "zh-tw",
  "tr",
  "cs",
  "th",
  "vi",
  "ko",
];

export abstract class ServerBlitzKitAPI11 extends ServerBlitzKitAPI10 {
  private async fetchCachedEncyclopedia(
    game: EncyclopediaGame,
    locale: string,
    language: string,
  ) {
    if (!import.meta.env.DEV) return fetchEncyclopedia(game, language);

    const { existsSync } = await import("fs");
    const { readFile, writeFile, mkdir } = await import("fs/promises");
    const root = "../../temp/encyclopedia";
    const cachePath = `${root}/${game}-${locale}.json`;

    if (existsSync(cachePath)) {
      const content = await readFile(cachePath, "utf-8");
      return JSON.parse(content) as EncyclopediaVehicle[];
    }

    const vehicles = await fetchEncyclopedia(game, language);

    await mkdir(root, { recursive: true });
    await writeFile(cachePath, JSON.stringify(vehicles));

    return vehicles;
  }

  private async fetchDescriptions(game: EncyclopediaGame) {
    const descriptions: Record<string, Map<number, EncyclopediaVehicle>> = {};

    await Promise.all(
      locales.supported.map(async (supported) => {
        const language = supported.variant_wg_api ?? supported.locale;

        if (!WG_API_LANGUAGES.includes(language)) return;

        const vehicles = await this.fetchCachedEncyclopedia(
          game,
          supported.locale,
          language,
        );

        descriptions[supported.locale] = new Map(
          vehicles.map((vehicle) => [vehicle.tank_id, vehicle]),
        );
      }),
    );

    return descriptions;
  }

  @Cache()
  async descriptionDefinitions() {
    const descriptionDefinitions = DescriptionDefinitions.create();
    const tankDefinitions = await this.tankDefinitions();

    console.log("Fetching tank descriptions...");

    const blitz = await this.fetchDescriptions("wotb");
    const wot = await this.fetchDescriptions("wot");
    const wotVehicles = [...wot[locales.default].values()];
    const unmatched: string[] = [];

    for (const tank of Object.values(tankDefinitions.tanks)) {
      const match = matchDescription(tank, blitz[locales.default], wotVehicles);

      if (match === null) {
        unmatched.push(tank.dev_name);
        continue;
      }

      const localized = match.via === "blitz" ? blitz : wot;
      const text: I18nString = {
        locales: { [locales.default]: match.vehicle.description! },
      };

      for (const locale in localized) {
        const description = localized[locale].get(
          match.vehicle.tank_id,
        )?.description;

        if (!description || description === match.vehicle.description) {
          continue;
        }

        text.locales[locale] = description;
      }

      descriptionDefinitions.descriptions[tank.id] = {
        text,
        source:
          match.via === "blitz"
            ? DescriptionSource.DESCRIPTION_SOURCE_BLITZ
            : DescriptionSource.DESCRIPTION_SOURCE_WOT,
      };
    }

    console.warn(
      `No description for ${unmatched.length} tanks: ${unmatched.join(", ")}`,
    );

    return descriptionDefinitions;
  }
}
