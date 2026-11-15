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

  const files = await vfs
    .dir(`Data/Gfx/UI/ModulesTechTree`)
    .then((files) =>
      files.filter(
        (file) =>
          !file.endsWith("@2x.packed.webp") && file.startsWith("vehicle")
      )
    );

  for (const file of files) {
    const nameRaw = file.match(/vehicle(.+)\.packed\.webp/)![1];
    const id = nameRaw[0].toLowerCase() + nameRaw.slice(1);
    const path = `Data/Gfx/UI/ModulesTechTree/${file}`;

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
