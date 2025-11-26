import sharp from "sharp";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";

export async function boosterIcons() {
  console.log("Building booster icons...");

  using uploader = new AssetUploader("booster icons");
  const boosterFiles = (vfs.dir(`Data/Gfx/Shared/boosters`)).filter(
    (file) => !file.includes("@2x.txt") && !file.startsWith("texture0")
  );
  const image = sharp(
    await vfs.file(`Data/Gfx/Shared/boosters/texture0.packed.webp`)
  );

  for (const file of boosterFiles) {
    const name = file.match(/booster_(.+).txt/)?.[1];

    if (name === undefined) continue;

    const sizes = (await vfs.text(`Data/Gfx/Shared/boosters/${file}`))
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
