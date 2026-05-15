import { api } from "../../api/dynamic";

/**
 * Woah! test.
 */
export async function GET() {
  const tiers = await api.tiers();
  return Response.json(tiers);
}
