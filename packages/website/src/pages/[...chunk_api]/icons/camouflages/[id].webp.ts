import type { CamouflagesXml } from "@blitzkit/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { extractPackedIcon } from "../../../../core/blitz/extractPackedIcon";
import { parsePackedSpriteRect } from "../../../../core/blitz/parsePackedSpriteRect";
import { api } from "../../../../core/blitzkit/api";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const camouflageDefinitions = await api.camouflageDefinitions();
  const camouflagesXml = await vfs.xml<{ root: CamouflagesXml }>(
    "Data/XML/item_defs/vehicles/common/camouflages.xml",
  );
  const icons = new Map(
    Object.values(camouflagesXml.root.camouflages).map((camouflage) => [
      camouflage.id,
      camouflage.icon,
    ]),
  );
  const paths: GetStaticPathsItem[] = [];

  for (const camouflage of Object.values(camouflageDefinitions.camouflages)) {
    const icon = icons.get(camouflage.id);

    if (camouflage.tank_id === undefined || !icon) continue;

    paths.push({
      params: { id: camouflage.id },
      props: {
        path: icon.replace("~res:/", "Data/").replace(/\.txt$/, ""),
      },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<{ path: string }>) {
  const path = (await vfs.resolve(`${props.path}@2x.packed.webp`))
    ? `${props.path}@2x.packed.webp`
    : `${props.path}.packed.webp`;
  const packed = await vfs.file(path);
  const texture = sharp(packed);
  const sizes = parsePackedSpriteRect(packed);
  const image = sizes
    ? sharp(await extractPackedIcon(texture, sizes))
    : texture;
  const bytes = await image.webp().toBuffer();

  return new Response(new Uint8Array(bytes));
}
