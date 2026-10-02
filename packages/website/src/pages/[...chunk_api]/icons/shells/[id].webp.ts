import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const files = await vfs
    .dir(`Data/Gfx/Shared/tank-supply/ammunition/big`)
    .then((files) => files.filter((file) => file.endsWith("_l.txt")));

  for (const file of files) {
    const id = file.match(/(.+)_l\.txt/)![1];
    const sizes = (
      await vfs.text(`Data/Gfx/Shared/tank-supply/ammunition/big/${file}`)
    )
      .split("\n")[4]
      .split(" ")
      .map(Number);

    paths.push({
      params: { id },
      props: { sizes },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<{ sizes: number[] }>) {
  const image = sharp(
    await vfs.file(
      `Data/Gfx/Shared/tank-supply/ammunition/big/texture0.packed.webp`,
    ),
  );
  const buffer = await image
    .clone()
    .extract({
      left: props.sizes[0],
      top: props.sizes[1],
      width: props.sizes[2],
      height: props.sizes[3],
    })
    .toBuffer();
  const bytes = new Uint8Array(buffer);

  return new Response(bytes);
}
