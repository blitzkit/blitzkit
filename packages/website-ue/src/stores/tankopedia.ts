import type { Tank } from "@protos/blitzkit/tank";
import { Varuna } from "varuna";
import { createTankState } from "../core/tankopedia/createTankState";
import { type TankState } from "../core/tankopedia/tankState";

interface Tankopedia {
  compare: TankopediaCompare;
  protagonist: TankState;
}

export enum TankopediaCompare {
  TierAndClass,
  Tier,
  All,
}

export const Tankopedia = new Varuna<Tankopedia, Tank>((tank) => ({
  compare: TankopediaCompare.TierAndClass,

  protagonist: createTankState(tank),
}));
