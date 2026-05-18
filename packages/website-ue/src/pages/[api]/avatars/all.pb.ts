import { Avatars } from "@protos/avatars";
import { api } from "../../../api/dynamic";

export async function GET() {
  const avatars = await api.avatars();
  return new Response(Avatars.encode(avatars).finish());
}
