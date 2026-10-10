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

const ENCYCLOPEDIA_LANGUAGES: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  pl: "pl",
  ru: "ru",
  zh: "zh-cn",
};

async function fetchCachedEncyclopedia(game: EncyclopediaGame, locale: string) {
  if (!import.meta.env.DEV) {
    return fetchEncyclopedia(game, ENCYCLOPEDIA_LANGUAGES[locale]);
  }

  const { existsSync } = await import("fs");
  const { readFile, writeFile, mkdir } = await import("fs/promises");
  const root = "../../temp/encyclopedia";
  const cachePath = `${root}/${game}-${locale}.json`;

  if (existsSync(cachePath)) {
    const content = await readFile(cachePath, "utf-8");
    return JSON.parse(content) as EncyclopediaVehicle[];
  }

  const vehicles = await fetchEncyclopedia(
    game,
    ENCYCLOPEDIA_LANGUAGES[locale],
  );

  await mkdir(root, { recursive: true });
  await writeFile(cachePath, JSON.stringify(vehicles));

  return vehicles;
}

async function fetchDescriptions(game: EncyclopediaGame) {
  const descriptions: Record<string, Map<number, EncyclopediaVehicle>> = {};

  await Promise.all(
    Object.keys(ENCYCLOPEDIA_LANGUAGES).map(async (locale) => {
      const vehicles = await fetchCachedEncyclopedia(game, locale);

      descriptions[locale] = new Map(
        vehicles.map((vehicle) => [vehicle.tank_id, vehicle]),
      );
    }),
  );

  return descriptions;
}

export abstract class ServerBlitzKitAPI11 extends ServerBlitzKitAPI10 {
  @Cache()
  async descriptionDefinitions() {
    const descriptionDefinitions = DescriptionDefinitions.create();
    const tankDefinitions = await this.tankDefinitions();

    console.log("Fetching tank descriptions...");

    const blitz = await fetchDescriptions("wotb");
    const wot = await fetchDescriptions("wot");
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
