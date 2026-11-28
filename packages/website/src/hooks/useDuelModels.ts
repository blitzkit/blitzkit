import { Tankopedia } from "../stores/tankopedia";
import { resolveTankModels } from "../tankopedia/resolveTankModels";
import type { DuelSide } from "./useEquipment";

// Every model of a side
export function useDuelModels(side: DuelSide) {
  const state = Tankopedia.use((state) => state[side]);

  return resolveTankModels(state);
}

export function getDuelModels(side: DuelSide) {
  return resolveTankModels(Tankopedia.state[side]);
}
