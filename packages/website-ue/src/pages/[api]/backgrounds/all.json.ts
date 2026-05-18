import { api } from "../../../api/dynamic";

export async function GET() {
  const { backgrounds } = await api.backgrounds();
  return Response.json(backgrounds);
}
