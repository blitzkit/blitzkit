import { Avatars } from "@protos/avatars";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const avatars = await api.avatars();
  return new Response(Avatars.encode(avatars).finish());
}
