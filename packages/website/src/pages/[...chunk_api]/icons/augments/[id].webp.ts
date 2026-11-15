import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import {
  readPackedSprite,
  type PackedSpriteProps,
} from "../../../../core/blitz/readSprite";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

const ROOT = "Data/Gfx/Lobby/icons/upgrades";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const files = await vfs.dir(ROOT);

  for (const file of files) {
    if (file.endsWith("@2x.packed.webp")) continue;

    const match = file.match(/^(.+)\.packed\.webp$/);

    if (match === null) continue;

    paths.push({
      params: { id: match[1] },
      props: { packed: `${ROOT}/${file}` },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<PackedSpriteProps>) {
  return new Response(await readPackedSprite(props.packed));
}
