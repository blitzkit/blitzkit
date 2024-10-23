import { fetchEquipmentDefinitions } from '@blitzkit/core';
import type { EquipmentMatrix } from '../../stores/duel';

export async function hasEquipment(
  id: number,
  equipmentPreset: string,
  equipmentMatrix: EquipmentMatrix,
) {
  const equipmentDefinitions = await fetchEquipmentDefinitions();
  const preset = equipmentDefinitions.presets[equipmentPreset];
  return preset.slots.some((slot, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const choice = equipmentMatrix[row][column];

    if (choice === 0) return false;

    const equipped = slot[choice === -1 ? 'left' : 'right'];

    return equipped === id;
  });
}
