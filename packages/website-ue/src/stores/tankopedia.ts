import { Varuna } from "varuna";
import type { TankState } from "../core/tankopedia/tankState";

interface Tankopedia {
  protagonist: TankState;
}

export const Tankopedia = new Varuna<Tankopedia, number>((maxStage) => ({
  protagonist: { stage: maxStage, shell: 0 },
}));
