import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useEquipment(presetId: string, priceId: string) {
  const [, presetName] = presetId.split(".");
  const [, priceName] = priceId.split(".");
  const preset = useAwait(
    () => api.equipmentPreset(presetId),
    `equipment-preset-${presetName}`,
  );
  const price = useAwait(
    () => api.equipmentPricePreset(priceId),
    `equipment-price-${priceName}`,
  );

  return { preset, price };
}
