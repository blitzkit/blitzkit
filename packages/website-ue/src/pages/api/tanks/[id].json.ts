import type { APIContext } from "astro";
import { api } from "../../../core/api/dynamic";

export { getStaticPaths } from "./[id].pb";

/**
 * Even Noah can't save these animals.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const tank = await api.tank(params.id);
  return Response.json(tank);
}
