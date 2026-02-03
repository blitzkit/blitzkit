import type { APIContext } from "astro";
import { api } from "../../../core/api/dynamic";
import { game } from "../../../core/game/game";

export { getStaticPaths } from "./[id].pb";

export async function GET({ params }: APIContext<never, { id: string }>) {
  const tank = await api.tank(params.id);
  const image = game.tankBigIcon(params.id, tank.tank!.visual_data);
  return new Response(new Uint8Array(image));
}
