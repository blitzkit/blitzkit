import { api } from "../../../core/api/dynamic";

export async function GET() {
  const { avatars } = await api.avatars();
  return Response.json(avatars);
}
