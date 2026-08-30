import { ModelDefinitions } from "@blitzkit/core";
import { api } from "../../../blitzkit/api";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.models();
  const bytes = ModelDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
