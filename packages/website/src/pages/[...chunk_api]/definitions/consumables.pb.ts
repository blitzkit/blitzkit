import { ConsumableDefinitions } from "@blitzkit/core";
import { api } from "../../../core/blitzkit/api";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.consumableDefinitions();

  console.dir(definitions, { depth: null });

  const bytes = ConsumableDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
