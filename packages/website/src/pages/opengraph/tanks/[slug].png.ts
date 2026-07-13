import {
  asset,
  fetchEquipmentDefinitions,
  fetchModelDefinitions,
  fetchProvisionDefinitions,
  fetchSkillDefinitions,
  fetchTankDefinitions,
  TankType,
  TIER_ROMAN_NUMERALS,
} from "@blitzkit/core";
import { unwrapper } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import type { APIRoute, GetStaticPaths } from "astro";
import {
  buildTankPosterPayload,
  grayHex,
} from "../../../core/blitzkit/armorPoster/buildTankPosterPayload";
import { computeThicknessRanges } from "../../../core/blitzkit/armorPoster/computeThicknessRanges";
import { getSharedArmorPosterRenderer } from "../../../core/blitzkit/armorPoster/sharedRenderer";
import { getStrings } from "../../../core/i18n/getStrings";
import { embedRasterImage } from "../../../core/blitzkit/openGraphPoster/embedRasterImage";
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  renderPoster,
} from "../../../core/blitzkit/openGraphPoster/renderPoster";
import {
  TankPoster,
  type TankPosterArmorLegend,
} from "../../../core/blitzkit/openGraphPoster/TankPoster";
import { TREE_TYPE_ACCENT_COLORS } from "../../../core/blitzkit/openGraphPoster/treeTypeColors";
import { tankSeoCharacteristics } from "../../../core/blitzkit/tankSeoCharacteristics";

/** One of the largest tanks in the game - used to calibrate a single standardized camera distance applied to every tank, so tanks render at their real relative size instead of each being zoomed to fill the frame. */
const REFERENCE_SLUG = "type-5-heavy";

interface Props {
  id: number;
  /**
   * Poster text is only generated in the default locale for now - keep
   * this locale-parameterized instead of hardwalled to "en" so a
   * follow-up can loop getStaticPaths over locales.supported later.
   */
  locale: string;
}

export const prerender = true;

const [
  tankDefinitions,
  modelDefinitions,
  skillDefinitions,
  provisionDefinitions,
  equipmentDefinitions,
] = await Promise.all([
  fetchTankDefinitions(),
  fetchModelDefinitions(),
  fetchSkillDefinitions(),
  fetchProvisionDefinitions(),
  fetchEquipmentDefinitions(),
]);

const thicknessRanges = computeThicknessRanges(tankDefinitions);
const referenceTank = Object.values(tankDefinitions.tanks).find(
  (tank) => tank.slug === REFERENCE_SLUG,
);
const referencePayload =
  referenceTank &&
  (await buildTankPosterPayload(
    referenceTank,
    modelDefinitions,
    thicknessRanges[referenceTank.tier],
  ));
const fixedDistance = referencePayload?.fitDistance;

export const getStaticPaths = (async () => {
  return Object.values(tankDefinitions.tanks).map((tank) => ({
    params: { slug: tank.slug },
    props: { id: tank.id, locale: locales.default },
  }));
}) satisfies GetStaticPaths;

async function tankVisuals(
  id: number,
): Promise<{ backgroundImage: string; armorLegend?: TankPosterArmorLegend }> {
  const tank = tankDefinitions.tanks[id];
  const payload = await buildTankPosterPayload(
    tank,
    modelDefinitions,
    thicknessRanges[tank.tier],
    fixedDistance,
  );

  if (payload) {
    const renderer = await getSharedArmorPosterRenderer();
    const png = await renderer.render(payload);
    const range = thicknessRanges[tank.tier];

    return {
      backgroundImage: `data:image/png;base64,${png.toString("base64")}`,
      armorLegend: {
        maxLabel: `${Math.round(payload.maxThickness)}mm`,
        minLabel: `${Math.round(payload.minThickness)}mm`,
        maxColor: grayHex(payload.maxThickness, range),
        minColor: grayHex(payload.minThickness, range),
      },
    };
  }

  const backgroundImage = await embedRasterImage(
    asset(`icons/tanks/big/${id}.webp`),
    { grayscale: true, resize: { width: POSTER_WIDTH, height: POSTER_HEIGHT } },
  );
  return { backgroundImage };
}

export const GET: APIRoute<Props> = async ({ props }) => {
  const { id, locale } = props;
  const tank = tankDefinitions.tanks[id];
  const tankModelDefinition = modelDefinitions.models[tank.id];
  const strings = getStrings(locale);
  const unwrap = unwrapper(locale);

  const characteristics = tankSeoCharacteristics(
    tank,
    tankModelDefinition,
    skillDefinitions,
    provisionDefinitions,
    equipmentDefinitions,
  );

  const { backgroundImage, armorLegend } = await tankVisuals(id);

  const nationalityAdjective =
    strings.common.nations_adjectives[
      tank.nation as keyof typeof strings.common.nations_adjectives
    ];
  const classLabel = strings.common.tank_class_short[tank.class];
  const byline = `${
    tank.type === TankType.TANK_TYPE_PREMIUM ? "Premium " : ""
  }${nationalityAdjective} ${classLabel}`;

  const png = await renderPoster(
    TankPoster({
      name: unwrap(tank.name!),
      tierNumeral: TIER_ROMAN_NUMERALS[tank.tier],
      byline,
      backgroundImage,
      accentColor: TREE_TYPE_ACCENT_COLORS[tank.type],
      armorLegend,
      stats: [
        {
          label: "DPM",
          value: Math.round(characteristics.dpm).toLocaleString(locale),
        },
        {
          label: "Alpha damage",
          value: Math.round(characteristics.damage).toLocaleString(locale),
        },
        {
          label: "Penetration",
          value: `${Math.round(characteristics.penetration).toLocaleString(locale)}mm`,
        },
        {
          label: "Health",
          value: Math.round(characteristics.health).toLocaleString(locale),
        },
      ],
    }),
  );

  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
