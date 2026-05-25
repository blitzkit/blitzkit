import type { APIContext } from "astro";
import { api } from "../../../../api/dynamic";
import {
  clientUnmountedResponse,
  notFoundResponse,
} from "../../../../api/responses";
import { game } from "../../../../game/game";
import { clientUnmounted } from "../../../../game/unmounted";
import { getStaticPaths as _getStaticPaths } from "../../../[api]/tanks/[id].json";
import { getStaticPaths as __getStaticPaths } from "../../_index";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";

export const getStaticPaths = mixStaticPaths(__getStaticPaths, _getStaticPaths);

export async function GET({ params }: APIContext<never, { id: string }>) {
  if (clientUnmounted) return clientUnmountedResponse;

  const tank = await api.tank(params.id);
  const image = game!.tankBigIcon(params.id, tank.tank!.visual_data);

  if (image.length === 0) return notFoundResponse;

  return new Response(new Uint8Array(image));
}
