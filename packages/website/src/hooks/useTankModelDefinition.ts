import { Tankopedia } from "../stores/tankopedia";

export function useTankModelDefinition() {
  return Tankopedia.use((state) => state.model);
}
