import type { TankCatalogComponent } from "@protos/blitz_static_tank_component";
import { TerrainHardness } from "./tankState";

export function createTankState(tank: TankCatalogComponent) {
  return {
    stage: tank.upgrade_stages.length,
    shell: 0,
    isGunDamaged: false,
    isHullTraversing: false,
    isShooting: false,
    isTurretTraversing: false,
    speed: 0,
    terrainHardness: TerrainHardness.Hard,
    isCaughtOnFire: false,
  };
}
