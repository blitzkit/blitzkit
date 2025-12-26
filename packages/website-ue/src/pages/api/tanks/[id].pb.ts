import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";
import { Tank } from "../../../protos/tank";

export const getStaticPaths = (async () => {
  const { list } = await api.tankList();

  return list.map(({ id }) => ({ params: { id } }));
}) satisfies GetStaticPaths;

/**
 * Even Noah can't save these animals.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const tank = await api.tank(params.id);
  return new Response(Tank.encode(tank).finish());
}
