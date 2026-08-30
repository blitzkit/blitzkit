import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const fadedFiles = await vfs
    .dir(`Data/Gfx/Lobby/flags`)
    .then((files) =>
      files.filter(
        (flag) =>
          flag.startsWith("flag_filter_") && flag.endsWith("@2x.packed.webp"),
      ),
    );

  for (const flag of fadedFiles) {
    const path = `Data/Gfx/Lobby/flags/${flag}`;
    const id = flag.match(/flag_filter_(.+)@2x\.packed\.webp/)![1];

    paths.push({
      params: { id },
      props: { path },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<{ path: string }>) {
  const bytes = new Uint8Array(await vfs.file(props.path));

  return new Response(bytes);
}
