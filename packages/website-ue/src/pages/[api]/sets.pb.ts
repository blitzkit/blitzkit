import { Sets } from "@protos/sets";
import { api } from "../../api/dynamic";

export { getStaticPaths } from "./_index";

export async function GET() {
  const sets = await api.sets();
  return new Response(Sets.encode(sets).finish());
}
