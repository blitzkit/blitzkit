import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const files = await vfs
    .dir(`Data/Gfx/UI/ModulesTechTree`)
    .then((files) =>
      files.filter(
        (file) =>
          !file.endsWith("@2x.packed.webp") && file.startsWith("vehicle"),
      ),
    );

  for (const file of files) {
    const nameRaw = file.match(/vehicle(.+)\.packed\.webp/)![1];
    const id = nameRaw[0].toLowerCase() + nameRaw.slice(1);
    const path = `Data/Gfx/UI/ModulesTechTree/${file}`;

    paths.push({
      params: { id },
      props: { path },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<{ path: string }>) {
  const buffer = await sharp(await vfs.file(props.path))
    .trim()
    .toBuffer();
  const bytes = new Uint8Array(buffer);

  return new Response(bytes);
}
