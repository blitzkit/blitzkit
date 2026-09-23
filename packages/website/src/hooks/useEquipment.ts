import { useMemo } from "react";
import { api } from "../api/dynamic";
import { Tankopedia } from "../stores/tankopedia";

const equipment = await api.equipment();
const tanks = await api.tanks();

export type DuelSide = "protagonist" | "antagonist";

export function useEquipment(id: number, side: DuelSide) {
  const member = Tankopedia.use((state) => state[side]);
  const tank = tanks.tanks[member.tank];
  const preset = equipment.presets[tank.equipment_preset];
  const equipmentMatrix = Tankopedia.use(
    (state) => state[side].equipment_matrix,
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
