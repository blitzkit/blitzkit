import { fetchTankDefinitions } from '../blitzkit';
import type { BlitzStats } from './compositeStats/constants';

export async function getTierWeights(
  stats: Record<number, BlitzStats>,
  order: number[] = Object.keys(stats).map(parseInt),
) {
  const tankDefinitions = await fetchTankDefinitions();
  const tierWeights: TierWeightsRecord = {};

  order.forEach((id) => {
    const entry = tankDefinitions.tanks[id];

    if (!entry) return;
    if (!tierWeights[entry.tier]) tierWeights[entry.tier] = 0;

    tierWeights[entry.tier]! += stats[id].battles;
  });

  return tierWeights;
}
export type TierWeightsRecord = Partial<Record<number, number>>;
