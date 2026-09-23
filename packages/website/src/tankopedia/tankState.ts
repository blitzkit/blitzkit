import type { ModelDefinition } from "@blitzkit/core";
import type { EquipmentMatrix } from "./createTankState";

export interface TankState {
  tank: number;

  engine: number;
  turret: number;
  gun: number;
  shell: number;
  track: number;

  assault_distance: number;
  speed: number;

  equipment_matrix: EquipmentMatrix;
  status: Record<VehicleStatusKey, boolean>;

  model: ModelDefinition;

  consumables: number[];
  provisions: number[];
  camouflage: boolean;
  cooldown_booster: number;
}

export const vehicleStatusKeys = [
  ["commander_dead", "gunner_dead", "driver_dead", "loader_dead"],

  [
    "fuel_tank_damaged",
    "engine_damaged",
    "chassis_damaged",
    "viewport_damaged",
    "ammo_bay_damaged",
    "gun_damaged",
    "turret_damaged",
  ],

  ["caught_on_fire", "shooting", "turret_traversing", "hull_traversing"],
] as const;

export type VehicleStatusKey = (typeof vehicleStatusKeys)[number][number];
