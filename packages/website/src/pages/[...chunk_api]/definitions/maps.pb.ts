import { MapDefinitions } from "@blitzkit/core";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.map();
  const bytes = MapDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
