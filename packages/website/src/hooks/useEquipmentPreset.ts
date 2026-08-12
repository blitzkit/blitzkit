import { api } from "../core/blitzkit/api";

const equipmentDefinitions = await api.equipmentDefinitions();

export function useEquipmentPreset(preset: string) {
  return equipmentDefinitions.presets[preset];
}
