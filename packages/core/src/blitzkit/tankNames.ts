import { BlitzKitAPI } from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import { deburr } from "lodash-es";
import { I18nString } from "../protos";

export async function fetchTankNames(api: BlitzKitAPI) {
  const [tankDefinitions, camouflageDefinitions] = await Promise.all([
    api.tankDefinitions(),
    api.camouflageDefinitions(),
  ]);
  const tankDefinitionsArray = Object.values(tankDefinitions.tanks);

  return await Promise.all(
    tankDefinitionsArray.map(async (tank) => {
      const searchableNameDeburr: I18nString = { locales: {} };

      Object.entries(tank.name!).forEach(([key, value]) => {
        searchableNameDeburr.locales[key] = deburr(value);
      });

      const searchableNameFull: I18nString = {
        locales: { ...tank.name_full?.locales },
      };
      const searchableNameFullDeburr: I18nString = { locales: {} };

      Object.entries(searchableNameFull.locales).forEach(([key, value]) => {
        searchableNameFullDeburr.locales[key] = deburr(value);
      });

      return {
        id: tank.id,
        name: tank.name,
        searchableName: tank.name,
        searchableNameDeburr,
        searchableNameFull,
        searchableNameFullDeburr,
        camouflages: tank.camouflages
          ?.map((id) =>
            locales.supported.map(
              ({ locale }) =>
                camouflageDefinitions.camouflages[id]?.name!.locales[locale],
            ),
          )
          .flat()
          .filter(Boolean)
          .map(deburr)
          .join(" "),
        treeType: tank.type,
      };
    }),
  );
}

export const SEARCH_KEYS = [
  ...locales.supported
    .map(({ locale }) => [
      `searchableName.locales.${locale}`,
      `searchableNameDeburr.locales.${locale}`,
      `searchableNameFull.locales.${locale}`,
      `searchableNameFullDeburr.locales.${locale}`,
    ])
    .flat(),
  "camouflages",
];
