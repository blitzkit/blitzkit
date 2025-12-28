import { api } from "../../core/api/dynamic";

/**
 * Literally all the tanks in one place lmao.
 */
export async function GET() {
  const tanks = await api.tanks();
  return Response.json(tanks);
}
