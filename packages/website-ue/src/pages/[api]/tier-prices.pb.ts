import { TierPrices } from "@protos/tier_prices";
import { api } from "../../api/dynamic";

export { getStaticPaths } from "./_index";

export async function GET() {
  const tierPrices = await api.tierPrices();
  return new Response(TierPrices.encode(tierPrices).finish());
}
