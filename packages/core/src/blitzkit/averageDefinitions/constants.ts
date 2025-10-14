import { emptyAllStats } from '../../blitz/constants';
import { Samples } from '../../protos';
import type { BlitzkitStats } from '../../statistics';

export const emptyAverageDefinitionsAllStats: BlitzkitStats = {
  ...emptyAllStats,
  battle_life_time: 0,
};

export const averageDefinitionsAllStatsKeys = Object.keys(
  emptyAverageDefinitionsAllStats,
) as (keyof BlitzkitStats)[];

export const emptySamples: Samples = {
  d_1: 0,
  d_7: 0,
  d_30: 0,
  d_60: 0,
  d_90: 0,
  d_120: 0,
  total: 0,
};
