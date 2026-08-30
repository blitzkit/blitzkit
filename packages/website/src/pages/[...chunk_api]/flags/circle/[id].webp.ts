import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const circleFiles = await vfs
    .dir(`Data/Gfx/Lobby/flags`)
    .then((files) =>
      files.filter(
        (flag) =>
          flag.startsWith("flag_profile-stat_") &&
          !flag.endsWith("@2x.packed.webp"),
      ),
    );

  for (const flag of circleFiles) {
    const path = `Data/Gfx/Lobby/flags/${flag}`;
    const id = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

    paths.push({
      params: { id },
      props: { path },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<{ path: string }>) {
  const image = sharp(await vfs.file(props.path));
  const content = await image.trim({ threshold: 100 }).toBuffer();
  const bytes = new Uint8Array(content);

  return new Response(bytes);
}
