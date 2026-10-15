import { useMemo } from "react";
import { api } from "../api/dynamic";
import { Tankopedia } from "../stores/tankopedia";

const equipment = await api.equipment();
const tanks = await api.tanks();

export const duelSides = ["protagonist", "antagonist"] as const;

export type DuelSide = (typeof duelSides)[number];

export function useEquipment(side: DuelSide, id: number) {
  const member = Tankopedia.use((state) => state[side]);
  const appliedEquipment = Tankopedia.use((state) => state[side].equipment);

  const tank = tanks.tanks[member.tank];

  const value = useMemo(
    () => hasEquipment(id, tank.equipment_preset, appliedEquipment),
    [appliedEquipment, member.tank],
  );

  return value;
}

export function hasEquipment(
  id: number,
  _preset: string,
  applied: Record<number, number>,
) {
  const preset = equipment.presets[_preset];

  return preset.slots.some((slot, index) => {
    if (!(index in applied)) return false;

    const choice = applied[index];

    return slot.options[choice] === id;
  });
}
