import { api } from "../../core/api/dynamic";
import { Tanks } from "../../protos/tanks";

/**
 * Literally all the tanks in one place lmao.
 */
export async function GET() {
  const tanks = await api.tanks();
  return new Response(Tanks.encode(tanks).finish());
}
