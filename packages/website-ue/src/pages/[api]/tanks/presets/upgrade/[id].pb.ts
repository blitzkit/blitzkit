import { TankUpgradePricePresetComponent } from "@protos/blitz_static_tank_upgrade_price_preset_component";
import type { APIContext } from "astro";
import { api } from "../../../../../api/dynamic";
import { mixStaticPaths } from "../../../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  return api.metadata
    .group("TankUpgradePricePresetEntity")
    .map(({ name }) => ({ params: { id: name } }));
});

export async function GET({ params }: APIContext<never, { id: string }>) {
  const preset = await api.tankUpgradePreset(params.id);
  return new Response(TankUpgradePricePresetComponent.encode(preset).finish());
}
