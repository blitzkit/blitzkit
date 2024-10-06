import { fetchEquipmentDefinitions } from '@blitzkit/core';
import { useMemo } from 'react';
import { Duel } from '../stores/duel';

const equipmentDefinitions = await fetchEquipmentDefinitions();

export function useEquipment(id: number, antagonist = false) {
  const member = Duel.use(
    (state) => state[antagonist ? 'antagonist' : 'protagonist']!,
  );
  const preset = equipmentDefinitions.presets[member.tank.equipmentPreset];
  const equipmentMatrix = Duel.use(
    (state) =>
      state[antagonist ? 'antagonist' : 'protagonist']!.equipmentMatrix,
  );
  const value = useMemo(() => {
    return preset.slots.some((slot, index) => {
      const row = Math.floor(index / 3);
      const column = index % 3;
      const choice = equipmentMatrix[row][column];

      if (choice === 0) return false;

      const equipped = slot[choice === -1 ? 'left' : 'right'];

      return equipped === id;
    });
  }, [equipmentMatrix, member.tank]);

  return value;
}
