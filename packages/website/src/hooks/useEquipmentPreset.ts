import { api } from "../api/dynamic";

const equipmentDefinitions = await api.equipment();

export function useEquipmentPreset(preset: string) {
  return equipmentDefinitions.presets[preset];
}
