import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

/**
 * List!
 */
export async function GET() {
  const list = await api.tankList();
  return Response.json(list);
}
