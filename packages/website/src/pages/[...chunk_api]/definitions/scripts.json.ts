import { api } from "../../../blitzkit/api";

export { getStaticPaths } from "../_index";

export async function GET() {
  const definitions = await api.scripts();
  return Response.json(definitions);
}
