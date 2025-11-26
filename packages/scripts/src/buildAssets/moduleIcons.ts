import sharp from "sharp";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";

export async function moduleIcons() {
  console.log("Building module icons...");

  using uploader = new AssetUploader("module icons");
  const files = vfs.dir(`Data/Gfx/UI/ModulesTechTree`).filter(
      (file) => !file.endsWith("@2x.packed.webp") && file.startsWith("vehicle")
    )

  for (const file of files) {
    const nameRaw = file.match(/vehicle(.+)\.packed\.webp/)![1];
    const name = nameRaw[0].toLowerCase() + nameRaw.slice(1);
    const content = await sharp(
      await vfs.file(`Data/Gfx/UI/ModulesTechTree/${file}`)
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
