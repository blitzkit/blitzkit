import { api } from "../core/api/dynamic";
import { Tankopedia } from "../stores/tankopedia";
import { useAwait } from "./useAwait";

export function useProtagonist() {
  const id = Tankopedia.use((state) => state.protagonist.id);
  const tank = useAwait(() => api.tank(id), `tank-${id}`);

  return tank;
}
