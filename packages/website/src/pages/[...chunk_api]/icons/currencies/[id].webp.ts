import { assertSecret, type BlitzGlossary } from "@blitzkit/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
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

  const glossary = await fetch(assertSecret(import.meta.env.WOTB_GLOSSARY))
    .then((response) => response.json() as Promise<BlitzGlossary>)
    .then((glossary) =>
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
  let buffer: Buffer;

  if (props.local) {
    buffer = await sharp(await vfs.file(props.source))
      .trim()
      .toBuffer();
  } else {
    const imageRaw = await fetch(props.source).then((response) =>
      response.arrayBuffer(),
    );
    buffer = await sharp(imageRaw)
      .trim({
        threshold: 100,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
  }

  const bytes = new Uint8Array(buffer);

  return new Response(bytes);
}
