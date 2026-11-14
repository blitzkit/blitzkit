import sharp from "sharp";
import { vfs } from "../../../core/blitzkit/vfs";

export { getStaticPaths } from "../_index";

export async function GET() {
  const buffer = await sharp(
    await vfs.file("Data/Gfx/UI/Hangar/IconCamouflage.packed.webp"),
  )
    .trim()
    .toBuffer();

  return new Response(new Uint8Array(buffer));
}
