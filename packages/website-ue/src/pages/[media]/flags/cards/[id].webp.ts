import { Nation } from "@protos/blitz_static_tank_component";
import type { APIContext } from "astro";
import { clientUnmountedResponse } from "../../../../api/responses";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { game } from "../../../../game/game";
import { clientUnmounted } from "../../../../game/unmounted";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  return Object.values(Nation)
    .filter(Number.isInteger)
    .map((id) => ({ params: { id } }));
});

/**
 * Even Noah can't save these animals.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  if (clientUnmounted) return clientUnmountedResponse;

  const enumName = Nation[Number(params.id)];
  const nationName = enumName.replace("NATION_", "").toLowerCase();
  const flag = game!.flag(nationName);

  return new Response(new Uint8Array(flag));
}
