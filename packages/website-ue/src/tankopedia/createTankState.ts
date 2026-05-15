import type { Tank } from "@protos/blitzkit/tank";
import { TerrainHardness, type TankState } from "./tankState";

export function createTankState({ tank, id }: Tank) {
  const upgrades: Record<string, number> = {};

  for (const upgradeLine of tank!.upgrade_lines) {
    upgrades[upgradeLine.name] = upgradeLine.stages.length - 1;
  }

  return {
    id,

    upgrades,

    shell: 0,
    speed: 0,
    terrainHardness: TerrainHardness.Hard,

    isShooting: false,
    isGunDamaged: false,
    isTurretTraversing: false,
    isHullTraversing: false,
    isCaughtOnFire: false,
  } satisfies TankState;
}
