import { Varuna } from "varuna";
import type { TankState } from "../core/tankopedia/tankState";

interface Tankopedia {
  protagonist: TankState;
}

export const Tankopedia = new Varuna<Tankopedia>({
  protagonist: { stage: 0, shell: 0 },
});
