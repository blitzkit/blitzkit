import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import {
  readDiscreteSprite,
  type DiscreteSpriteProps,
} from "../../../../core/blitz/readSprite";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const files = await vfs
    .dir(`Data/Gfx/Shared/tank-supply/ammunition/big`)
    .then((files) => files.filter((file) => file.endsWith("_l.txt")));

  for (const file of files) {
    const id = file.match(/(.+)_l\.txt/)![1];

    paths.push({
      params: { id },
      props: {
        descriptor: `Data/Gfx/Shared/tank-supply/ammunition/big/${file}`,
        texture: `Data/Gfx/Shared/tank-supply/ammunition/big/texture0.packed.webp`,
      },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<DiscreteSpriteProps>) {
  return new Response(
    await readDiscreteSprite(props.descriptor, props.texture)
  );
}
