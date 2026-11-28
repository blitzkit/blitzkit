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

  const boosterFiles = await vfs
    .dir("Data/Gfx/Shared/boosters")
    .then((files) =>
      files.filter(
        (file) => !file.includes("@2x.txt") && !file.startsWith("texture0")
      )
    );

  for (const file of boosterFiles) {
    const id = file.match(/booster_(.+).txt/)?.[1];

    if (id === undefined) continue;

    paths.push({
      params: { id },
      props: {
        descriptor: `Data/Gfx/Shared/boosters/${file}`,
        texture: `Data/Gfx/Shared/boosters/texture0.packed.webp`,
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
