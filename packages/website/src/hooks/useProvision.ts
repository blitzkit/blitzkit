import { Tankopedia } from "../stores/tankopedia";
import type { DuelSide } from "./useEquipment";

export function useProvision(side: DuelSide, id: number) {
  return Tankopedia.use((state) => state[side].provisions.includes(id));
}
