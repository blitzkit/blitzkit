import { TankClass } from "@blitzkit/core";
import type { ComponentProps, ReactNode } from "react";
import { ClassHeavy } from "./components/ClassHeavy";
import { ClassLight } from "./components/ClassLight";
import { ClassMedium } from "./components/ClassMedium";
import { ClassTankDestroyer } from "./components/ClassTankDestroyer";

export const classIcons: Record<
  TankClass,
  (props: ComponentProps<"svg">) => ReactNode
> = {
  [TankClass.TANK_CLASS_TANK_DESTROYER]: ClassTankDestroyer,
  [TankClass.TANK_CLASS_HEAVY]: ClassHeavy,
  [TankClass.TANK_CLASS_LIGHT]: ClassLight,
  [TankClass.TANK_CLASS_MEDIUM]: ClassMedium,
};
