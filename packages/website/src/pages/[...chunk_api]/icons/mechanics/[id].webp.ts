import { TANK_MECHANIC_ICONS } from "@blitzkit/core/src/blitzkit/tankMechanics";
import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  return Object.entries(TANK_MECHANIC_ICONS).map(
    ([id, icon]) =>
      ({
        params: { id },
        props: { path: `Data/Gfx/Lobby/icons/tank-mechanics/${icon}.packed.webp` },
      }) satisfies GetStaticPathsItem,
  );
});

export async function GET({ props }: APIContext<{ path: string }>) {
  const image = sharp(await vfs.file(props.path));
  const content = await image.trim().webp({ lossless: true }).toBuffer();

  return new Response(new Uint8Array(content));
}
