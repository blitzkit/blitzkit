export enum TerrainHardness {
  Soft,
  Medium,
  Hard,
}

export interface TankState {
  id: string;

  equipment: Record<number, number>;
  consumables: string[];

  upgrades: Record<string, number>;
  alternates: Record<string, boolean>;

  shell: number;
  speed: number;
  terrainHardness: TerrainHardness;

  status: Record<VehicleStatusKey, boolean>;
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
