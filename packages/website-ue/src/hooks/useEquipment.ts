import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useEquipment(presetId: string, priceId: string) {
  const equipment = useAwait(() => api.equipment(), "equipment");
  const preset = equipment.presets[presetId];
  const price = equipment.prices[priceId];

  return { preset, price, equipment };
}
