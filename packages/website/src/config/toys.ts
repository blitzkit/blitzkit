import type { ReactNode } from "react";
import {
  AssaultShellsToy,
  FlexibilityToy,
  ReloadToy,
  RicochetToy,
  TraverseToy,
  ViewRangeToy,
} from "../components/TankopediaToys";
import type { ComputedCharacteristics } from "../types/characteristics";

export interface ToyProps {
  characteristics: ComputedCharacteristics;
}

export const toys: Record<string, (props: ToyProps) => ReactNode> = {
  ricochet: RicochetToy,
  traverse: TraverseToy,
  reload: ReloadToy,
  view_range: ViewRangeToy,
  flexibility: FlexibilityToy,
  assault_shells: AssaultShellsToy,
};
