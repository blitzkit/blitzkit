import { PopularTanks } from "@protos/blitzkit/popular_tanks";
import { api } from "../../../core/api/dynamic";

export async function GET() {
  const popular = await api.popularTanks();
  return new Response(PopularTanks.encode(popular).finish());
}
