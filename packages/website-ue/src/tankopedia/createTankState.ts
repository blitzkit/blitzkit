import type { Tank } from "@protos/tank";
import { alternativeLines } from "../config/modules";
import {
  TerrainHardness,
  vehicleStatusKeys,
  type TankState,
  type VehicleStatusKey,
} from "./tankState";

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

  const status: Partial<Record<VehicleStatusKey, boolean>> = {};

  for (const key of vehicleStatusKeys) {
    status[key] = false;
  }

  return {
    id,

    equipment: {},
    consumables: [],

    upgrades,
    alternates,

    shell: 0,
    speed: 0,
    terrainHardness: TerrainHardness.Hard,

    isHullRotating: false,
    isTurretRotating: false,
    isGunRotating: false,

    status: status as Record<VehicleStatusKey, boolean>,
  } satisfies TankState;
}
