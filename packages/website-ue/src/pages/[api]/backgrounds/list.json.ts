import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const { backgrounds } = await api.backgrounds();
  const list = backgrounds.map((background) => background.name);
  return Response.json(list);
}
