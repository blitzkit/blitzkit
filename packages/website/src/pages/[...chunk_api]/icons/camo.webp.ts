import { vfs } from "../../../core/blitzkit/vfs";

export { getStaticPaths } from "../_index";

export async function GET() {
  const bytes = await vfs.file("Data/Gfx/UI/Hangar/IconCamouflage.packed.webp");
  return new Response(bytes);
}
