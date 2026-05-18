import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const { list } = await api.tankList();
  return list.map(({ id }) => ({ params: { id } }));
});

/**
 * Even Noah can't save these animals.
 * Even Noah can't save these animals.
 * Even Noah can't save these animals.
 * Even Noah can't save these animals.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const tank = await api.tank(params.id);
  return Response.json(tank);
}
