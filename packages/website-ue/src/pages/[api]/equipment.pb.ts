import { Equipment } from "@protos/equipment";
import { api } from "../../api/dynamic";

export async function GET() {
  const equipment = await api.equipment();
  return new Response(Equipment.encode(equipment).finish());
}
