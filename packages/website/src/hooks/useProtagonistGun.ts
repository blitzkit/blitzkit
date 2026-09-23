import { Tankopedia } from "../stores/tankopedia";
import { useProtagonistTurret } from "./useProtagonistTurret";

export function useProtagonistGun() {
  const id = Tankopedia.use((state) => state.protagonist.gun);
  const turret = useProtagonistTurret();
  return turret.guns[id];
}
