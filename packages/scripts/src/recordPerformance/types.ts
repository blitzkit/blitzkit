export type PerformanceManifest = PerformanceManifestV1;

interface PerformanceManifestV1 {
  version: 1;
  last_updated: number;
}

export interface QuickStatistics {
  status: string;
  data: Record<string, QuickStatisticsTank[] | null>;
}

interface QuickStatisticsTank {
  last_battle_time: number;
  battle_life_time: number;
  tank_id: number;

  all: Record<string, number>;
}

interface Observations {
  count: number;
  observations: Record<number, Observation>;
}

interface Observation {}
