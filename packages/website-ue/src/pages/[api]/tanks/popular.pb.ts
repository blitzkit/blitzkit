import { PopularTanks } from "@protos/popular_tanks";
import { api } from "../../../api/dynamic";

export async function GET() {
  const popular = await api.popularTanks();
  return new Response(PopularTanks.encode(popular).finish());
}
