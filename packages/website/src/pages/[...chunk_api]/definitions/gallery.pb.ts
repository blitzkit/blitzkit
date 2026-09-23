import { Gallery } from "@blitzkit/core";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.gallery();
  const bytes = Gallery.encode(definitions).finish();

  return new Response(bytes);
}
