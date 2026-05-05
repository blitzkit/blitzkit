import type { APIContext } from "astro";
import { api } from "../../../core/api/dynamic";
import {
  clientUnmountedResponse,
  notFoundResponse,
} from "../../../core/api/responses";
import { game } from "../../../core/game/game";
import { clientUnmounted } from "../../../core/game/unmounted";

export { getStaticPaths } from "./[id].json";

export async function GET({ params }: APIContext<never, { id: string }>) {
  if (clientUnmounted) return clientUnmountedResponse;

  const tank = await api.tank(params.id);
  const image = game!.tankBigIcon(params.id, tank.tank!.visual_data);

  if (image.length === 0) return notFoundResponse;

  return new Response(new Uint8Array(image));
}
