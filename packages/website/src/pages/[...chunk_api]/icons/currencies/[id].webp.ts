import { fetchGlossary } from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { readPackedSprite } from "../../../../core/blitz/readSprite";
import { getStaticPaths as _getStaticPaths } from "../../_index";

const ICONS = [
  ["currency_silver_m.packed.webp", "silver"],
  ["currency_premium_xl.packed.webp", "premium"],
  ["currency_gold_m.packed.webp", "gold"],
  ["currency_free-xp_xl.packed.webp", "free-xp"],
  ["currency_elite-xp_xl.packed.webp", "elite-xp"],
  ["currency_crew-xp_xl.packed.webp", "crew-xp"],
  ["currency_battle-xp_xl.packed.webp", "xp"],
];

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  console.log("Building currency icons...");

  for (const [file, id] of ICONS) {
    paths.push({
      params: { id },
      props: {
        local: true,
        source: `Data/Gfx/Lobby/currency/${file}`,
      },
    });
  }

  const glossary = await fetchGlossary(locales.default).then((glossary) =>
    Object.values(glossary)
      .entries()
      .filter(([key]) => /^prx_season_\d+$/.test(`${key}`)),
  );

  for (const [id, item] of glossary) {
    if (!item.image_url) continue;

    paths.push({
      params: { id },
      props: {
        local: false,
        source: item.image_url,
      },
    });
  }

  return paths;
});

export async function GET({
  props,
}: APIContext<{ local: boolean; source: string }>) {
  if (props.local) {
    return new Response(await readPackedSprite(props.source));
  }

  // The glossary already serves these cropped
  return new Response(
    await fetch(props.source).then((response) => response.arrayBuffer())
  );
}
