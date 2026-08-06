import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const scratchedFiles = await vfs
    .dir("Data/Gfx/Lobby/flags")
    .then((files) =>
      files.filter(
        (flag) =>
          flag.startsWith("flag_tutor-tank_") &&
          !flag.endsWith("@2x.packed.webp"),
      ),
    );

  for (const flag of scratchedFiles) {
    const path = `Data/Gfx/Lobby/flags/${flag}`;
    const id = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

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
