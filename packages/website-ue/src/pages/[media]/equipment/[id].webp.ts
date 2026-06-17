import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { notFoundResponse } from "../../../api/responses";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { game } from "../../../game/game";
import { getStaticPaths as _getStaticPaths } from "../_index";
import { assertDiscoveryTag } from "../../../game/assertDiscoveryTag";
import { bufferProxy } from "../../../api/bufferProxy";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () => {
  return api.metadata
    .group("EquipmentEntity")
    .map(({ id }) => ({ params: { id } }));
});

const HACK_nameMap: Record<string, string> = {
  SystemsFineTuning: "SystemFineTuning",
};

export function GET({ params }: APIContext<never, { id: string }>) {
  const item = api.metadata.item(params.id);
  const assetsDiscovery = item.BlitzStaticAssetsDiscovery();
  const tag = assertDiscoveryTag(assetsDiscovery);

  return bufferProxy(() => game!.equipmentIcon(tag), `equipment-icon-${tag}`);
}
