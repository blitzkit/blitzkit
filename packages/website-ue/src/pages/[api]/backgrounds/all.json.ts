import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const { backgrounds } = await api.backgrounds();
  return Response.json(backgrounds);
}
