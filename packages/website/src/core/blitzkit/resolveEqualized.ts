import {
  resolveDpm,
  type GunDefinition,
  type ShellDefinition,
  type TankDefinition,
} from "@blitzkit/core";
import { defaultEqualizer } from "./tankToDuelMember";

export const EQUALIZER_HEALTH_EPSILON = 50;

export function resolveEqualizer(tank: TankDefinition, equalize: boolean) {
  return (equalize ? tank.equalizer : undefined) ?? defaultEqualizer;
}

export function roundEqualizedHealth(health: number) {
  return (
    EQUALIZER_HEALTH_EPSILON * Math.round(health / EQUALIZER_HEALTH_EPSILON)
  );
}

export function resolveEqualizedHealth(
  tank: TankDefinition,
  equalize: boolean,
) {
  const health = tank.health + tank.turrets.at(-1)!.health;

  if (!equalize) return health;

  return roundEqualizedHealth(health * resolveEqualizer(tank, equalize).health);
}

export function resolveEqualizedDamage(
  tank: TankDefinition,
  shell: ShellDefinition,
  equalize: boolean,
) {
  return shell.armor_damage * resolveEqualizer(tank, equalize).damage;
}

export function resolveEqualizedDpm(
  tank: TankDefinition,
  gun: GunDefinition,
  shell: ShellDefinition,
  equalize: boolean,
) {
  return resolveDpm(gun, shell, resolveEqualizer(tank, equalize).damage);
}

export function resolveEqualizedPenetration(
  tank: TankDefinition,
  shell: ShellDefinition,
  equalize: boolean,
) {
  return shell.penetration!.near * resolveEqualizer(tank, equalize).penetration;
}
