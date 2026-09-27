import type {
  GunDefinition,
  TankDefinition,
  TurretDefinition,
} from "@blitzkit/core";
import { Soapstone } from "soapstone";

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

export const Mixer = new Soapstone<Mixer, [Mixer]>((data) => data);
