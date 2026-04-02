import type { TankDefinition } from "@blitzkit/core";

type TankEqualizer = NonNullable<TankDefinition["equalizer"]>;

export function hasEqualizerData(tank: TankDefinition) {
  return tank.equalizer !== undefined;
}

export function isEqualizerActive(tank: TankDefinition, enabled: boolean) {
  return enabled && hasEqualizerData(tank);
}

function resolveEqualizer(tank: TankDefinition, enabled: boolean) {
  if (!isEqualizerActive(tank, enabled)) return undefined;

  return tank.equalizer as TankEqualizer;
}

export function equalizerHealthFactor(tank: TankDefinition, enabled: boolean) {
  return resolveEqualizer(tank, enabled)?.max_health_factor ?? 1;
}

export function equalizerPenetrationFactor(
  tank: TankDefinition,
  enabled: boolean,
) {
  return resolveEqualizer(tank, enabled)?.piercing_power_factor ?? 1;
}

export function equalizerDamageFactor(tank: TankDefinition, enabled: boolean) {
  return resolveEqualizer(tank, enabled)?.damage_factor ?? 1;
}

export function equalizerArmorFactor(tank: TankDefinition, enabled: boolean) {
  return resolveEqualizer(tank, enabled)?.armor_factor ?? 1;
}

