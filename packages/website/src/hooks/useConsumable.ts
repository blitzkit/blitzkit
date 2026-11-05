import { Tankopedia } from "../stores/tankopedia";
import type { DuelSide } from "./useEquipment";

export function useConsumable(side: DuelSide, id: number) {
  return Tankopedia.use((state) => state[side].consumables.includes(id));
}
