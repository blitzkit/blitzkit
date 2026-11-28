import { api } from "../api/dynamic";

const equipment = await api.equipment();

export function useEquipmentPreset(preset: string) {
  return equipment.presets[preset];
}
