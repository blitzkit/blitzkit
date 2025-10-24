import { readdir } from "fs/promises";
import sharp from "sharp";
import { readDVPLFile } from "../../src/core/blitz/readDVPLFile";
import { AssetUploader } from "../core/github/assetUploader";
import { DATA } from "./constants";

export async function moduleIcons() {
  console.log("Building module icons...");

  using uploader = new AssetUploader("module icons");
  const files = await readdir(`${DATA}/Gfx/UI/ModulesTechTree`).then((dir) =>
    dir.filter(
      (file) => !file.endsWith("@2x.packed.webp") && file.startsWith("vehicle")
    )
  );

  for (const file of files) {
    const nameRaw = file.match(/vehicle(.+)\.packed\.webp/)![1];
    const name = nameRaw[0].toLowerCase() + nameRaw.slice(1);
    const content = await sharp(
      await readDVPLFile(`${DATA}/Gfx/UI/ModulesTechTree/${file}`)
    )
      .trim()
      .toBuffer();

    await uploader.add({
      content,
      path: `icons/modules/${name}.webp`,
    });
  }

  await uploader.flush();
}
