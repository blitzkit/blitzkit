import { ConsumableDefinitions } from "@blitzkit/core";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.consumables();
  const bytes = ConsumableDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
