import type { Tank } from "@protos/tank";
import { Varuna } from "varuna";
import { createTankState } from "../tankopedia/createTankState";
import { type TankState } from "../tankopedia/tankState";
import { characteristicsOrder } from "../tankopedia/characteristicsOrder";

interface Tankopedia {
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

for (const { group } of characteristicsOrder) {
  groups[group] = true;
}

export const Tankopedia = new Varuna<Tankopedia, Tank>((tank) => ({
  compare: TankopediaCompare.TierAndClass,
  groups,

  protagonist: createTankState(tank),
}));
