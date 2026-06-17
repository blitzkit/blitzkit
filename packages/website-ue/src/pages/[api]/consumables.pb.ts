import { Consumables } from "@protos/consumables";
import { api } from "../../api/dynamic";

export { getStaticPaths } from "./_index";

export async function GET() {
  const consumables = await api.consumables();
  return new Response(Consumables.encode(consumables).finish());
}
