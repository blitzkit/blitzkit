import { ProvisionDefinitions } from "@blitzkit/core";
import { api } from "../../../blitzkit/api";
import { vfs } from "../../../core/blitzkit/vfs";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.provisions();

  return Response.json(await vfs.yaml("Data/Strings/en.yaml"));

  const bytes = ProvisionDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
