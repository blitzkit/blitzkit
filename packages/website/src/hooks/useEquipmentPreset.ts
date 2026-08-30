import { api } from "../blitzkit/api";

const equipmentDefinitions = await api.equipment();

export function useEquipmentPreset(preset: string) {
  return equipmentDefinitions.presets[preset];
}
