import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { notFoundResponse } from "../../../api/responses";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { game } from "../../../game/game";
import { getStaticPaths as _getStaticPaths } from "../_index";

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
  const assetDiscovery = item.BlitzStaticAssetsDiscovery();
  const names = assetDiscovery.required_tags!.tags.map(
    (tag) => tag.value.split(".").at(-1)!,
  );

  for (const name of names) {
    if (name in HACK_nameMap) {
      names.push(HACK_nameMap[name]);
    }
  }

  const icon = game!.equipmentIcon(names);

  if (icon.length === 0) {
    return notFoundResponse;
  }

  const array = new Uint8Array(icon);

  return new Response(array);
}
