import { Tiers } from "@protos/tiers";
import { api } from "../../api/dynamic";

export { getStaticPaths } from "./_index";

/**
 * Woah!
 */
export async function GET() {
  const tiers = await api.tiers();
  return new Response(Tiers.encode(tiers).finish());
}
