import { TankClass, TankType } from "../protos";
import type { BlitzStats } from "../statistics";

export const TANK_TYPES = [
  TankType.TANK_TYPE_RESEARCHABLE,
  TankType.TANK_TYPE_PREMIUM,
  TankType.TANK_TYPE_COLLECTOR,
];

export const TANK_TYPE_COMMAND_NAMES = {
  [TankType.TANK_TYPE_RESEARCHABLE]: "researchable",
  [TankType.TANK_TYPE_PREMIUM]: "premium",
  [TankType.TANK_TYPE_COLLECTOR]: "collector",
};

export const TANK_CLASSES = [
  TankClass.TANK_CLASS_LIGHT,
  TankClass.TANK_CLASS_MEDIUM,
  TankClass.TANK_CLASS_HEAVY,
  TankClass.TANK_CLASS_TANK_DESTROYER,
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
