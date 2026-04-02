import type { Armor } from '@blitzkit/core';

export function resolveArmor(armor: Armor, index: number, factor = 1) {
  const spaced = armor.spaced?.includes(index) ?? false;
  const thickness = index === -1 ? 0 : (armor.thickness[index] ?? 0) * factor;

  return { spaced, thickness };
}
