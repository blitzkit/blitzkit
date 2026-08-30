import { useMemo } from "react";
import { api } from "../core/blitzkit/api";
import { Duel } from "../stores/duel";

const equipmentDefinitions = await api.equipment();

export function useEquipment(id: number, antagonist = false) {
  const member = Duel.use(
    (state) => state[antagonist ? "antagonist" : "protagonist"]!,
  );
  const preset = equipmentDefinitions.presets[member.tank.equipment_preset];
  const equipmentMatrix = Duel.use(
    (state) =>
      state[antagonist ? "antagonist" : "protagonist"]!.equipmentMatrix,
  );
  const value = useMemo(() => {
    return preset.slots.some((slot, index) => {
      const row = Math.floor(index / 3);
      const column = index % 3;
      const choice = equipmentMatrix[row][column];

      if (choice === 0) return false;

      const equipped = slot[choice === -1 ? "left" : "right"];

      return equipped === id;
    });
  }, [equipmentMatrix, member.tank]);

  return value;
}
