import { api } from "../../../core/api/dynamic";

export async function GET() {
  const { backgrounds } = await api.backgrounds();
  const list = backgrounds.map((background) => background.name);
  return Response.json(list);
}
