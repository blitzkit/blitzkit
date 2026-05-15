export enum TerrainHardness {
  Soft,
  Medium,
  Hard,
}

export interface TankState {
  id: string;

  upgrades: Record<string, number>;

  shell: number;
  speed: number;
  terrainHardness: TerrainHardness;

  isShooting: boolean;
  isGunDamaged: boolean;
  isTurretTraversing: boolean;
  isHullTraversing: boolean;
  isCaughtOnFire: boolean;
}
