import type { TankDefinition } from "@blitzkit/core";

export function hasUpgrades(tank: TankDefinition) {
  return (
    tank.tracks.length > 1 ||
    tank.engines.length > 1 ||
    tank.turrets.length > 1 ||
    tank.turrets.some((turret) => turret.guns.length > 1)
  );
}
