import { api } from "../../../core/api/dynamic";

export async function GET() {
  const { avatars } = await api.avatars();
  const list = avatars.map((avatar) => avatar.name);
  return Response.json(list);
}
