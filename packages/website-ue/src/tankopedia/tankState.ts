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

  isShooting: boolean;
  isGunDamaged: boolean;
  isTurretTraversing: boolean;
  isHullTraversing: boolean;
  isCaughtOnFire: boolean;
}
