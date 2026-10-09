import type { APIContext } from "astro";
import sharp from "sharp";
import { vfs } from "../../../../../core/blitzkit/vfs";
import { mapsYamlEntry } from "../../../../../core/maps/mapsYamlEntry";
import { extractPackedTankIcon } from "../../../tanks/[id]/icons/big.webp";

export { getStaticPaths } from "../_index";

const ICON_WIDTH = 1024;
const ICON_ASPECT_RATIO = 3 / 4;

export async function GET({ props }: APIContext<{ id: number }>) {
  const { key } = await mapsYamlEntry(props.id);
  const icon = await extractPackedTankIcon(
    await vfs.file(
      `Data/Gfx/UI/BattleLoadingScreen/${key}/BackgroundLoading.packed.webp`,
    ),
  );
  const bytes = await sharp(icon)
    .resize(ICON_WIDTH, ICON_WIDTH * ICON_ASPECT_RATIO, { fit: "fill" })
    .webp()
    .toBuffer();

  return new Response(new Uint8Array(bytes));
}
