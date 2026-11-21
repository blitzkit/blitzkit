import type { TankmenAvatar } from "@blitzkit/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import {
  readPackedSprite,
  type PackedSpriteProps,
} from "../../../../core/blitz/readSprite";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const avatar = await vfs.xml<{ root: TankmenAvatar }>(
    `Data/XML/item_defs/tankmen/avatar.xml`
  );

  for (const key in avatar.root.skills) {
    const skill = avatar.root.skills[key];
    const icon = Array.isArray(skill.icon) ? skill.icon[0] : skill.icon;
    const id = icon.name.split("/").at(-1)!.replace(/_\d$/, "");
    const path = `Data${icon.name.replace("~res:", "")}.packed.webp`;

    paths.push({
      params: { id },
      props: { packed: path },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<PackedSpriteProps>) {
  return new Response(await readPackedSprite(props.packed));
}
