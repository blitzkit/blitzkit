import { Tiers } from "@protos/blitzkit/tiers";
import { api } from "../../core/api/dynamic";

/**
 * Woah!
 */
export async function GET() {
  const tiers = await api.tiers();
  return new Response(Tiers.encode(tiers).finish());
}
