import { CamouflageDefinitions } from "@blitzkit/protos";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.camouflages();
  const bytes = CamouflageDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
