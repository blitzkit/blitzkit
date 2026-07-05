import { TankUpgradePresets } from "@protos/tank_upgrade_presets";
import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

export async function GET() {
  const preset = await api.tankUpgradePresets();
  return new Response(TankUpgradePresets.encode(preset).finish());
}
