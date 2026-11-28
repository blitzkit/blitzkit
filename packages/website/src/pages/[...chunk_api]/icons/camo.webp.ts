import { readPackedSprite } from "../../../core/blitz/readSprite";

export { getStaticPaths } from "../_index";

export async function GET() {
  return new Response(
    await readPackedSprite("Data/Gfx/UI/Hangar/IconCamouflage.packed.webp"),
  );
}
