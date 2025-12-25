import { Varuna } from "varuna";
import { TerrainHardness, type TankState } from "../core/tankopedia/tankState";

interface Tankopedia {
  protagonist: TankState;
}

export const Tankopedia = new Varuna<Tankopedia, number>((maxStage) => ({
  protagonist: {
    stage: maxStage,
    shell: 0,
    isGunDamaged: false,
    isHullTraversing: false,
    isShooting: false,
    isTurretTraversing: false,
    speed: 0,
    terrainHardness: TerrainHardness.Hard,
  },
}));
