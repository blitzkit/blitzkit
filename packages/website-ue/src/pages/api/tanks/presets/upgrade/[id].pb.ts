import { TankUpgradePricePresetComponent } from "@protos/blitz/blitz_static_tank_upgrade_price_preset_component";
import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../../../api/dynamic";

export const getStaticPaths = (async () => {
  return api.metadata
    .group("TankUpgradePricePresetEntity")
    .map(({ name }) => ({ params: { id: name } }));
}) satisfies GetStaticPaths;

export async function GET({ params }: APIContext<never, { id: string }>) {
  const preset = await api.tankUpgradePreset(params.id);
  return new Response(TankUpgradePricePresetComponent.encode(preset).finish());
}
