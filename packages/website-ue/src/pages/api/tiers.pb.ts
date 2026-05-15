import { Tiers } from "@protos/blitzkit/tiers";
import { api } from "../../api/dynamic";

/**
 * Woah!
 */
export async function GET() {
  const tiers = await api.tiers();
  return new Response(Tiers.encode(tiers).finish());
}
