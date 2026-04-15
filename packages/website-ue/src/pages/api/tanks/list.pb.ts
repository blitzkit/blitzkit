import { TankList } from "@protos/blitzkit/tank_list";
import { api } from "../../../core/api/dynamic";

/**
 * List!!
 */
export async function GET() {
  const list = await api.tankList();
  return new Response(TankList.encode(list).finish());
}
