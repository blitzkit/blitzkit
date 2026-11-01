import type { APIContext } from "astro";
import sharp from "sharp";
import { vfs } from "../../../../../core/blitzkit/vfs";
import { mapsYamlEntry } from "../../../../../core/maps/mapsYamlEntry";
import { extractPackedTankIcon } from "../../../tanks/[id]/icons/big.webp";

export { getStaticPaths } from "../_index";

export async function GET({ props }: APIContext<{ id: number }>) {
  const { key } = await mapsYamlEntry(props.id);
  const icon = await extractPackedTankIcon(
    await vfs.file(
      `Data/Gfx/UI/BattleScreenHUD/minimap/${key}/MiniMapSmall@2x.packed.webp`,
    ),
  );
  const bytes = await sharp(icon).webp().toBuffer();

  return new Response(new Uint8Array(bytes));
}
