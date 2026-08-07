import { MapDefinitions } from "@blitzkit/core";
import { api } from "../../../core/blitzkit/api";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.mapDefinitions();
  const bytes = MapDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
