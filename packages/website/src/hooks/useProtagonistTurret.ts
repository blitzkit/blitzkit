import { Tankopedia } from "../stores/tankopedia";
import { useProtagonist } from "./useProtagonist";

export function useProtagonistTurret() {
  const id = Tankopedia.use((state) => state.protagonist.gun);
  const tank = useProtagonist();
  return tank.turrets[id];
}
