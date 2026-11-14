import type { BlitzTankClass } from "@blitzkit/core";
import { TankClass } from "@blitzkit/protos";

export const tankClassToBlitzTankClass: Record<TankClass, BlitzTankClass> = {
  [TankClass.TANK_CLASS_LIGHT]: "lightTank",
  [TankClass.TANK_CLASS_MEDIUM]: "mediumTank",
  [TankClass.TANK_CLASS_HEAVY]: "heavyTank",
  [TankClass.TANK_CLASS_TANK_DESTROYER]: "AT-SPG",
};
