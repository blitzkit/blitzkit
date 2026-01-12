import { api } from "../../../core/api/dynamic";
import { Avatars } from "../../../protos/avatars";

export async function GET() {
  const avatars = await api.avatars();
  return new Response(Avatars.encode(avatars).finish());
}
