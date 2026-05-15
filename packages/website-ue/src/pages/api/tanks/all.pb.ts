import { Tanks } from "@protos/blitzkit/tanks";
import { api } from "../../../api/dynamic";

/**
 * Literally all the tanks in one place lmao.
 */
export async function GET() {
  const tanks = await api.tanks();
  return new Response(Tanks.encode(tanks).finish());
}
