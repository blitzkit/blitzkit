import { TankClass } from "@blitzkit/core";
import sharp from "sharp";
import { readDVPLFile } from "../core/blitz/readDVPLFile";
import { readXMLDVPL } from "../core/blitz/readXMLDVPL";
import { AssetUploader } from "../core/github/assetUploader";
import { DATA } from "./constants";

interface SkillIcon {
  name: string;
  state: number;
}

export interface Avatar {
  roles: unknown;
  skillsByClasses: Record<TankClass, string>;
  skills: {
    [name: string]: {
      userString: string;
      effectDescription: string;
      tipDescription: string;
      icon: SkillIcon | SkillIcon[];
      type: "continuous" | "trigger";
    };
  };
}

export async function skillIcons() {
  console.log("Building skill icons...");

  const avatar = await readXMLDVPL<{ root: Avatar }>(
    `${DATA}/XML/item_defs/tankmen/avatar.xml`
  );
  using uploader = new AssetUploader("skill icons");

  for (const key in avatar.root.skills) {
    const skill = avatar.root.skills[key];
    const icon = Array.isArray(skill.icon) ? skill.icon[0] : skill.icon;
    const name = icon.name.split("/").at(-1)!.replace(/_\d$/, "");
    const path = `${DATA}${icon.name.replace("~res:", "")}.packed.webp`;
    const image = sharp(await readDVPLFile(path)).trim();
    const content = await image.toBuffer();

    await uploader.add({ content, path: `icons/skills/${name}.webp` });
  }

  await uploader.flush();
}
