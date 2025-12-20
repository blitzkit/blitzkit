export interface TankState {
  stage: number;

  shell: number;
  speed: number;
  isHullTraversing: boolean;
  isTurretTraversing: boolean;
  isShooting: boolean;
  isGunDamaged: boolean;
}
