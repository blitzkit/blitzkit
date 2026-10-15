import { Tankopedia } from "../stores/tankopedia";
import type { DuelSide } from "./useEquipment";

export function useDuelModel(side: DuelSide) {
  return Tankopedia.use((state) => state[side].model);
}
