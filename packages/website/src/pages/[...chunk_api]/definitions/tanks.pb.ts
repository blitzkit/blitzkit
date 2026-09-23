import { TankDefinitions } from "@blitzkit/core";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.tanks();
  const bytes = TankDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
