import { TankClass, TankType } from "@blitzkit/core";
import type { SupplementaryStats } from "@blitzkit/core/src/blitz/getAccountInfo";
import { calculateWN8 } from "@blitzkit/core/src/statistics/calculateWN8";
import type { BlitzStats } from "@blitzkit/core/src/statistics/compositeStats";
import { sumAllStats } from "@blitzkit/core/src/statistics/sumAllStats";
import {
  averageDefinitions,
  tankDefinitions,
} from "../blitzkit/nonBlockingPromises";

export interface StatFilters {
  nation?: string;
  tier?: number;
  class?: TankClass;
  type?: TankType;
  tank?: number;
}

export async function filterStats(
  { diff, order }: DiffedTankStats,
  filters: StatFilters,
) {
  // tank, if provided, takes priority over all other filters
  if (filters.tank) filters = { tank: filters.tank };

  const awaitedTankDefinitions = await tankDefinitions;
  const awaitedTankAverages = await averageDefinitions;
  const filteredOrder = order.filter((id) => {
    const entry = awaitedTankDefinitions.tanks[id];

    return (
      entry &&
      (filters.nation === undefined || entry.nation === filters.nation) &&
      (filters.tier === undefined || entry.tier === filters.tier) &&
      (filters.class === undefined || entry.class === filters.class) &&
      (filters.type === undefined ||
        (filters.type === TankType.COLLECTOR &&
          entry.type === TankType.COLLECTOR) ||
        (filters.type === TankType.PREMIUM &&
          entry.type === TankType.PREMIUM) ||
        (filters.type === TankType.RESEARCHABLE &&
          entry.type === TankType.RESEARCHABLE)) &&
      (filters.tank === undefined || entry.id === filters.tank)
    );
  });
  const stats = sumAllStats(filteredOrder.map((id) => diff[id]));
  const battlesOfTanksWithAverages = filteredOrder.reduce<number>(
    (accumulator, id) =>
      awaitedTankAverages.averages[id]
        ? accumulator + diff[id].battles
        : accumulator,
    0,
  );
  const battlesOfTanksWithTankDefinition = filteredOrder.reduce<number>(
    (accumulator, id) =>
      awaitedTankDefinitions.tanks[id]
        ? accumulator + diff[id].battles
        : accumulator,
    0,
  );
  const supplementary = {
    WN8:
      filteredOrder.reduce<number>(
        (accumulator, id) =>
          awaitedTankAverages.averages[id]
            ? accumulator +
              calculateWN8(awaitedTankAverages.averages[id].mu, diff[id]) *
                diff[id].battles
            : accumulator,
        0,
      ) / battlesOfTanksWithAverages,
    tier:
      filteredOrder.reduce<number>(
        (accumulator, id) =>
          awaitedTankDefinitions.tanks[id]
            ? accumulator +
              awaitedTankDefinitions.tanks[id]!.tier * diff[id].battles
            : accumulator,
        0,
      ) / battlesOfTanksWithTankDefinition,
  } satisfies SupplementaryStats;

  return { stats, supplementary, filteredOrder };
}

export interface DiffedTankStats {
  diff: Record<number, BlitzStats>;
  order: number[];
}
