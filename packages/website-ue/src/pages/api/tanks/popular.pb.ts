import { api } from "../../../core/api/dynamic";
import { PopularTanks } from "../../../protos/popular_tanks";

export async function GET() {
  const popular = await api.popularTanks();
  return new Response(PopularTanks.encode(popular).finish());
}
