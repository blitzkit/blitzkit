import { Equipment } from "@protos/equipment";
import { api } from "../../api/dynamic";

export { getStaticPaths } from "./_index";

export async function GET() {
  const equipment = await api.equipment();
  return new Response(Equipment.encode(equipment).finish());
}
