export const TANK_MECHANICS = [
  "MovableArmor",
  "ShotDispersionStabilizator",
  "ReducedSpotDuration",
  "LTCamo",
  "InternalTrack",
  "DesertPower",
  "ImprovedDetection",
  "TrayShell",
  "ReserveAmmo",
  "DoubleShot",
  "TripleShot",
  "ATGM",
] as const;

export type TankMechanic = (typeof TANK_MECHANICS)[number];

export const TANK_MECHANIC_ICONS: Record<TankMechanic, string> = {
  MovableArmor: "movable-armor/icon_movable-armor_l",
  ShotDispersionStabilizator:
    "shot-dispersion-stabilizator/icon_shot-dispersion-stabilizator_l",
  ReducedSpotDuration: "reduced-spot-duration/icon_reduced-spot-duration_l",
  LTCamo: "lt-camo/icon_lt-camo_l",
  InternalTrack: "internal-track/icon_tank-machanic_internal-track_l",
  DesertPower: "desert-power/icon_tank-machanic_desert-power_l",
  ImprovedDetection: "improved-detection/icon_tank-machanic_light_l",
  TrayShell: "tray-shell/icon_tray-shell_l",
  ReserveAmmo: "reserve-ammo/icon_reserve_shell_l",
  DoubleShot: "double-shot/icon_double-shot_l",
  TripleShot: "triple-shot/icon_triple-shot_l",
  ATGM: "atgm/icon_atgm_l",
};
