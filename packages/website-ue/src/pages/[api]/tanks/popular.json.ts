import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const popular = await api.popularTanks();
  return Response.json(popular);
}
