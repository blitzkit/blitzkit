import { Nation } from "@protos/game/proto/legacy/blitz_static_tank_component";
import type { APIContext, GetStaticPaths } from "astro";
import { game } from "../../../core/game/game";

export const getStaticPaths = (async () => {
  return Object.values(Nation)
    .filter(Number.isInteger)
    .map((id) => ({ params: { id } }));
}) satisfies GetStaticPaths;

/**
 * Even Noah can't save these animals.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const enumName = Nation[Number(params.id)];
  const nationName = enumName.replace("NATION_", "").toLowerCase();
  const flag = game.flag(nationName);

  return new Response(new Uint8Array(flag));
}
