import { awaitableEquipmentDefinitions } from "../core/awaitables/equipmentDefinitions";

const equipmentDefinitions = await awaitableEquipmentDefinitions;

export function useEquipmentPreset(preset: string) {
  return equipmentDefinitions.presets[preset];
}
