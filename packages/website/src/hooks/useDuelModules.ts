import { resolveTankModules } from "../tankopedia/resolveTankModules";
import { Tankopedia } from "../stores/tankopedia";
import type { DuelSide } from "./useEquipment";

// Every module of a side
export function useDuelModules(side: DuelSide) {
  const state = Tankopedia.use((state) => state[side]);

  return resolveTankModules(state);
}

export function getDuelModules(side: DuelSide) {
  return resolveTankModules(Tankopedia.state[side]);
}
