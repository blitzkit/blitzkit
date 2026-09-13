import { ConsumableDefinitions } from "@blitzkit/core";
import { api } from "../../../blitzkit/api";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.consumables();
  const bytes = ConsumableDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
