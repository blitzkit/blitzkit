import { Gallery } from "@blitzkit/core";
import { api } from "../../../../core/blitzkit/api";

export { getStaticPaths } from "../../_index";

export async function GET() {
  const definitions = await api.galleryDefinitions();
  const bytes = Gallery.encode(definitions).finish();

  return new Response(bytes);
}
