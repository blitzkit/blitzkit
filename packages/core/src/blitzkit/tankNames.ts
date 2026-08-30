import { BlitzKitAPI } from "@blitzkit/core/src/blitzkit/api/base";
import locales from "@blitzkit/i18n/locales.json";
import { deburr, times } from "lodash-es";
import { I18nString } from "../protos";

export async function fetchTankNames(api: BlitzKitAPI) {
  const [tankDefinitions, camouflageDefinitions] = await Promise.all([
    api.tanks(),
    api.camouflages(),
  ]);
  const tankDefinitionsArray = Object.values(tankDefinitions.tanks);

  return await Promise.all(
    tankDefinitionsArray.map(async (tank) => {
      const name_deburr: I18nString = I18nString.create();
      const camouflages_deburr: I18nString[] = [];

      const camouflages = tank.camouflages.map(
        (id) => camouflageDefinitions.camouflages[id].name!,
      );

      Object.entries(tank.name!).forEach(([key, value]) => {
        name_deburr.locales[key] = deburr(value);
      });

      camouflages.forEach((camouflage, index) => {
        camouflages_deburr[index] = I18nString.create();
        Object.entries(camouflage).forEach(([key, value]) => {
          camouflages_deburr[index].locales[key] = deburr(value);
        });
      });

      return {
        id: tank.id,
        slug: tank.slug,
        dev_name: tank.dev_name,

        name: tank.name!,
        name_deburr,

        camouflages,
        camouflages_deburr,
      };
    }),
  );
}

export const SEARCH_KEYS = [
  "id",
  "slug",
  "dev_name",

  ...locales.supported
    .map(({ locale }) => [
      `name.locales.${locale}`,
      `name_deburr.locales.${locale}`,

      ...times(8, (index) => [
        `camouflages.${index}.locales.${locale}`,
        `camouflages_deburr.${index}.locales.${locale}`,
      ]),
    ])
    .flat(2),
];
