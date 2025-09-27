import locales from "@blitzkit/i18n/locales.json";
import { deburr } from "lodash-es";
import { I18nString } from "../protos";
import { fetchCamouflageDefinitions } from "./camouflageDefinitions";
import { fetchTankDefinitions } from "./tankDefinitions";

export async function fetchTankNames() {
  const [tankDefinitions, camouflageDefinitions] = await Promise.all([
    fetchTankDefinitions(),
    fetchCamouflageDefinitions(),
  ]);
  const tankDefinitionsArray = Object.values(tankDefinitions.tanks);

  return await Promise.all(
    tankDefinitionsArray.map(async (tank) => {
      const searchableNameDeburr: I18nString = { locales: {} };

      Object.entries(tank.name).forEach(([key, value]) => {
        searchableNameDeburr.locales[key] = deburr(value);
      });

      return {
        id: tank.id,
        name: tank.name,
        searchableName: tank.name,
        searchableNameDeburr,
        camouflages: tank.camouflages
          ?.map((id) =>
            locales.supported.map(
              ({ locale }) =>
                camouflageDefinitions.camouflages[id]?.name.locales[locale]
            )
          )
          .flat()
          .filter(Boolean)
          .map(deburr)
          .join(" "),
        treeType: tank.type,
      };
    })
  );
}

export const SEARCH_KEYS = [
  ...locales.supported
    .map(({ locale }) => [
      `searchableName.locales.${locale}`,
      `searchableNameDeburr.locales.${locale}`,
    ])
    .flat(),
  "camouflages",
];
