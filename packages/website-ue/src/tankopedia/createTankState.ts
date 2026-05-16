import type { Tank } from "@protos/tank";
import { alternativeLines } from "../config/alternativeLines";
import { TerrainHardness, type TankState } from "./tankState";

export function createTankState({ tank, id }: Tank) {
  const upgrades: Record<string, number> = {};
  const alternates: Record<string, boolean> = {};

  for (const upgradeLine of tank!.upgrade_lines) {
    upgrades[upgradeLine.name] = upgradeLine.stages.length - 1;

    if (
      upgradeLine.name in alternativeLines &&
      tank!.upgrade_lines.some(
        (line) => line.name === alternativeLines[upgradeLine.name],
      )
    ) {
      alternates[upgradeLine.name] = true;
    }
  }

  return {
    id,

    upgrades,
    alternates,

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
