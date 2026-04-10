import { Avatars } from "@protos/blitzkit/avatars";
import { api } from "../../../core/api/dynamic";

export async function GET() {
  const avatars = await api.avatars();
  return new Response(Avatars.encode(avatars).finish());
}
