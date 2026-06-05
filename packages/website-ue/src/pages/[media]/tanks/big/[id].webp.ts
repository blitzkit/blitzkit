import type { APIContext } from "astro";
import { api } from "../../../../api/dynamic";
import { clientUnmountedResponse } from "../../../../api/responses";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { assertDiscoveryTag } from "../../../../game/assertDiscoveryTag";
import { game } from "../../../../game/game";
import { clientUnmounted } from "../../../../game/unmounted";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const { list } = await api.tankList();
  return list.map(({ id }) => ({ params: { id } }));
});

export async function GET({ params }: APIContext<never, { id: string }>) {
  if (clientUnmounted) return clientUnmountedResponse;

  const item = api.metadata.item(params.id);
  const assetDiscovery = item.BlitzStaticAssetsDiscovery();
  const tag = assertDiscoveryTag(assetDiscovery);
  const icon = game!.tankBigIcon(tag);
  const array = new Uint8Array(icon);

  return new Response(array);
}
