import type { Armor } from "@blitzkit/protos";

export function resolveArmor(armor: Armor, index: number) {
  const spaced = armor.spaced?.includes(index) ?? false;
  const thickness = index === -1 ? 0 : (armor.thickness[index] ?? 0);

  return { spaced, thickness };
}
