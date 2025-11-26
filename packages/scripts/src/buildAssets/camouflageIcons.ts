import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";

export async function camouflageIcons() {
  console.log("Building camouflage icons...");

  using uploader = new AssetUploader("camo icons");
  const content = await vfs.file(
    `Data/Gfx/UI/Hangar/IconCamouflage.packed.webp`
  );

  await uploader.add({ content, path: "icons/camo.webp" });
  await uploader.flush();
}
