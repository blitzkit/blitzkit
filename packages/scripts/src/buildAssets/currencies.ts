import { assertSecret, BlitzGlossary } from "@blitzkit/core";
import sharp from "sharp";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";

const ICONS = [
  ["currency_silver_m.packed.webp", "silver"],
  ["currency_premium_xl.packed.webp", "premium"],
  ["currency_gold_m.packed.webp", "gold"],
  ["currency_free-xp_xl.packed.webp", "free-xp"],
  ["currency_elite-xp_xl.packed.webp", "elite-xp"],
  ["currency_crew-xp_xl.packed.webp", "crew-xp"],
  ["currency_battle-xp_xl.packed.webp", "xp"],
];

export async function currencies() {
  console.log("Building currency icons...");

  using uploader = new AssetUploader("currency icons");

  for (const [file, name] of ICONS) {
    const content = await sharp(
      await vfs.file(`Data/Gfx/Lobby/currency/${file}`)
    )
      .trim()
      .toBuffer();

    await uploader.add({
      content,
      path: `icons/currencies/${name}.webp`,
    });
  }

  const glossary = await fetch(assertSecret(import.meta.env.WOTB_GLOSSARY))
    .then((response) => response.json() as Promise<BlitzGlossary>)
    .then((glossary) =>
      Object.values(glossary)
        .entries()
        .filter(([key]) => /^prx_season_\d+$/.test(`${key}`))
    );

  for (const [key, item] of glossary) {
    if (item.image_url === null) throw new Error(`No image_url for ${key}`);

    const imageRaw = await fetch(item.image_url).then((response) =>
      response.arrayBuffer()
    );
    const content = await sharp(imageRaw)
      .trim({
        threshold: 100,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    await uploader.add({
      content,
      path: `icons/currencies/${key}.webp`,
    });
  }

  await uploader.flush();
}
