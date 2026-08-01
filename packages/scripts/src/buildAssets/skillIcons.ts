import sharp from "sharp";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";

export async function skillIcons() {
  console.log("Building skill icons...");

  const avatar = await vfs.xml<{ root: TankmenAvatar }>(
    `Data/XML/item_defs/tankmen/avatar.xml`,
  );
  const uploader = new AssetUploader("skill icons");

  for (const key in avatar.root.skills) {
    const skill = avatar.root.skills[key];
    const icon = Array.isArray(skill.icon) ? skill.icon[0] : skill.icon;
    const name = icon.name.split("/").at(-1)!.replace(/_\d$/, "");
    const path = `Data${icon.name.replace("~res:", "")}.packed.webp`;
    const image = sharp(await vfs.file(path)).trim();
    const content = await image.toBuffer();

    await uploader.add({ content, path: `icons/skills/${name}.webp` });
  }

  await uploader.flush();
}
