import { readdir } from "fs/promises";
import sharp from "sharp";
import { readDVPLFile } from "../../src/core/blitz/readDVPLFile";
import { readStringDVPL } from "../../src/core/blitz/readStringDVPL";
import { AssetUploader } from "../core/github/assetUploader";
import { DATA } from "./constants";

export async function boosterIcons() {
  console.log("Building booster icons...");

  using uploader = new AssetUploader("booster icons");
  const boosterFiles = (await readdir(`${DATA}/Gfx/Shared/boosters`)).filter(
    (file) => !file.includes("@2x.txt") && !file.startsWith("texture0")
  );
  const image = sharp(
    await readDVPLFile(`${DATA}/Gfx/Shared/boosters/texture0.packed.webp`)
  );

  for (const file of boosterFiles) {
    const name = file.match(/booster_(.+).txt/)?.[1];

    if (name === undefined) continue;

    const sizes = (await readStringDVPL(`${DATA}/Gfx/Shared/boosters/${file}`))
      .split("\n")[4]
      .split(" ")
      .map(Number);
    const content = await image
      .clone()
      .extract({
        left: sizes[0],
        top: sizes[1],
        width: sizes[2],
        height: sizes[3],
      })
      .toBuffer();

    await uploader.add({
      path: `icons/boosters/${name}.webp`,
      content,
    });
  }

  await uploader.flush();
}
