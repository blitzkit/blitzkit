import sharp from "sharp";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";

export async function shellIcons() {
  console.log("Building shell icons...");

  using uploader = new AssetUploader("shell icons");
  const image = sharp(
    await vfs.file(
      `Data/Gfx/Shared/tank-supply/ammunition/big/texture0.packed.webp`
    )
  );
  const files = vfs.dir(
    `Data/Gfx/Shared/tank-supply/ammunition/big`
  ).filter((file) => file.endsWith("_l.txt"))

  for (const file of files) {
    const name = file.match(/(.+)_l\.txt/)![1];
    const sizes = (
      await vfs.text(
        `Data/Gfx/Shared/tank-supply/ammunition/big/${file}`
      )
    )
      .split("\n")[4]
      .split(" ")
      .map(Number);

    await uploader.add({
      content: await image
        .clone()
        .extract({
          left: sizes[0],
          top: sizes[1],
          width: sizes[2],
          height: sizes[3],
        })
        .toBuffer(),
      path: `icons/shells/${name}.webp`,
    });
  }

  await uploader.flush();
}
