import { Tankopedia } from "../stores/tankopedia";
import { useProtagonistTank } from "./useProtagonistTank";

export function useProtagonistTurret() {
  const id = Tankopedia.use((state) => state.protagonist.gun);
  const tank = useProtagonistTank();
  return tank.turrets[id];
}
