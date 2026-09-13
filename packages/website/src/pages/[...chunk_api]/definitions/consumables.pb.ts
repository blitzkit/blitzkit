import { ConsumableDefinitions } from "@blitzkit/core";
import { api } from "../../../blitzkit/api";
import { vfs } from "../../../core/blitzkit/vfs";

export { getStaticPaths } from "../_index";

export async function GET() {
  const test = await vfs.xml(
    "Data/XML/item_defs/vehicles/common/consumables/common.xml",
  );

  return Response.json(test);

  const definitions = await api.consumables();

  return Response.json(definitions);

  const bytes = ConsumableDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
