import { api } from "../../../core/api/dynamic";
import { TankList } from "../../../protos/tank_list";

/**
 * Literally all the tanks in one place lmao.
 */
export async function GET() {
  const list = await api.tankList();
  return new Response(TankList.encode(list).finish());
}
