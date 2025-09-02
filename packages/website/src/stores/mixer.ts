import type {
  GunDefinition,
  TankDefinition,
  TurretDefinition,
} from "@blitzkit/core";
import { Varuna } from "varuna";

export interface Mixer {
  hull: TankDefinition;
  turret: {
    tank: TankDefinition;
    turret: TurretDefinition;
  };
  gun: {
    tank: TankDefinition;
    turret: TurretDefinition;
    gun: GunDefinition;
  };
}

export const Mixer = new Varuna<Mixer, Mixer>((data) => data);
