import type { TankDefinitions } from "@blitzkit/core";

/**
 * Same normalization the live "static armor" view uses (see
 * packages/website/src/components/Tankopedia/HeroSection/index.tsx): the
 * average near-penetration of the top gun across every tank at a given
 * tier, x 0.75. Computed once per tier (1-10) rather than per-tank since
 * it only depends on tier. Equalizer is always the generic default (all
 * multipliers 1) here, matching the "generic loadout" convention the rest
 * of the opengraph poster pipeline uses.
 */
export function computeThicknessRanges(
  tankDefinitions: TankDefinitions,
): Record<number, number> {
  const penetrationByTier = new Map<number, number[]>();

  for (const tank of Object.values(tankDefinitions.tanks)) {
    const shell = tank.turrets.at(-1)!.guns.at(-1)!.shells[0];
    const near = shell.penetration!.near;

    if (!penetrationByTier.has(tank.tier)) penetrationByTier.set(tank.tier, []);
    penetrationByTier.get(tank.tier)!.push(near);
  }

  const ranges: Record<number, number> = {};

  for (const [tier, penetrations] of penetrationByTier) {
    const average =
      penetrations.reduce((sum, value) => sum + value, 0) / penetrations.length;

    ranges[tier] = average * (3 / 4);
  }

  return ranges;
}
