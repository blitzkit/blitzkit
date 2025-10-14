import { TankClass, TankType } from "../protos";
import type { BlitzStats } from "../statistics";

export const TANK_TYPES = [
  TankType.RESEARCHABLE,
  TankType.PREMIUM,
  TankType.COLLECTOR,
];

export const TANK_TYPE_COMMAND_NAMES = {
  [TankType.RESEARCHABLE]: "researchable",
  [TankType.PREMIUM]: "premium",
  [TankType.COLLECTOR]: "collector",
};

export const TANK_CLASSES = [
  TankClass.LIGHT,
  TankClass.MEDIUM,
  TankClass.HEAVY,
  TankClass.TANK_DESTROYER,
];

export const emptyAllStats: BlitzStats = {
  battles: 0,
  capture_points: 0,
  damage_dealt: 0,
  damage_received: 0,
  dropped_capture_points: 0,
  frags: 0,
  frags8p: 0,
  hits: 0,
  losses: 0,
  max_frags: 0,
  max_xp: 0,
  shots: 0,
  spotted: 0,
  survived_battles: 0,
  xp: 0,
  win_and_survived: 0,
  wins: 0,
};
