import { CamouflageDefinitions } from "@blitzkit/core";
import { api } from "../../../blitzkit/api";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.camouflages();
  const bytes = CamouflageDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
