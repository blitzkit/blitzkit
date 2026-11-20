import { MapDefinitions } from "@blitzkit/protos";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.maps();
  const bytes = MapDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
