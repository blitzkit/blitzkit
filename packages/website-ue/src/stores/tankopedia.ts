import type { Tank } from "@protos/tank";
import { Varuna } from "varuna";
import { createTankState } from "../tankopedia/createTankState";
import { type TankState } from "../tankopedia/tankState";
import { characteristicsOrder } from "../config/characteristicsOrder";

interface Tankopedia {
  disturbed: boolean;

  compare: TankopediaCompare;
  groups: Record<string, boolean>;

  protagonist: TankState;
}

export enum TankopediaCompare {
  TierAndClass,
  Tier,
  All,
}

const groups: Record<string, boolean> = {};

for (const { name } of characteristicsOrder) {
  groups[name] = true;
}

export const Tankopedia = new Varuna<Tankopedia, Tank>((tank) => ({
  disturbed: false,

  compare: TankopediaCompare.TierAndClass,
  groups,

  protagonist: createTankState(tank),
}));
