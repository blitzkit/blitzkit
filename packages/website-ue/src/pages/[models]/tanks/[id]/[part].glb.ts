import { Document, NodeIO } from "@gltf-transform/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import { api } from "../../../../api/dynamic";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../_index";
import { assertDiscoveryTag } from "../../../../game/assertDiscoveryTag";
import { game } from "../../../../game/game";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const tanks = await api.tanks();
  const paths: GetStaticPathsItem[] = [];

  for (const id in tanks.tanks) {
    const tank = tanks.tanks[id];
    const parts = new Set<string>(["chassis", "hull"]);

    for (const line of tank.tank!.upgrade_lines) {
      for (const stage of line.stages) {
        for (const change of stage.visual_changes) {
          parts.add(change.name);
        }
      }
    }

    for (const part of parts) {
      paths.push({ params: { id, part } });
    }
  }

  return paths;
});

export async function GET({
  params,
}: APIContext<never, { id: string; part: string }>) {
  const item = api.metadata.item(params.id);
  const assetDiscovery = item.BlitzStaticAssetsDiscovery();
  const tag = assertDiscoveryTag(assetDiscovery);
  const bytes = game!.tankPart(tag, params.part);
  const array = new Uint8Array(bytes);

  return new Response(array);
}
