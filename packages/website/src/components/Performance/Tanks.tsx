import { Table } from "@radix-ui/themes";
import { times } from "lodash-es";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";
import usePromise from "react-promise-suspense";
import { awaitableAverageDefinitions } from "../../core/awaitables/averageDefinitions";
import { awaitableTankDefinitions } from "../../core/awaitables/tankDefinitions";
import { filterTanks } from "../../core/blitzkit/filterTanks";
import { Performance } from "../../stores/performance";
import { TankFilters } from "../../stores/tankFilters";
import { TankPerformanceSort } from "../../stores/tankPerformanceSort";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { RowLoader } from "./RowLoader";
import { TankRow } from "./TankRow";
import { Total } from "./Total";

const PREVIEW_COUNT = 10;
const DEFAULT_LOADED_ROWS = 25;

const [tankDefinitions, averageDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableAverageDefinitions,
]);

const tankList = Object.values(tankDefinitions.tanks);

export function Tanks({ skeleton }: MaybeSkeletonComponentProps) {
  if (skeleton) {
    return (
      <Table.Body>
        {times(16, (index) => (
          <RowLoader key={index} />
        ))}
      </Table.Body>
    );
  }

  const sort = TankPerformanceSort.use();
  const filters = TankFilters.use();
  const filteredTanks = usePromise(
    () =>
      filterTanks(filters, tankList).then((tanks) =>
        tanks.filter(({ id }) => id in averageDefinitions.averages)
      ),
    // react-promise-suspense has awful type annotations
    [filters] as any
  );
  const tanksMapped = useMemo(
    () =>
      filteredTanks.map(({ id }) => ({
        id,
        ...averageDefinitions.averages[id],
      })),
    [filters]
  );
  const tanksSorted = useMemo(() => {
    const { playerCountPeriod } = Performance.state;

    switch (sort.type) {
      case "accuracy":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction * (a.mu.hits / a.mu.shots - b.mu.hits / b.mu.shots)
        );
      case "capture_points":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.capture_points / a.mu.battles -
              b.mu.capture_points / b.mu.battles)
        );
      case "damage":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_dealt / a.mu.battles -
              b.mu.damage_dealt / b.mu.battles)
        );
      case "damage_ratio":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_dealt / a.mu.damage_received -
              b.mu.damage_dealt / b.mu.damage_received)
        );
      case "damage_taken":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_received / a.mu.battles -
              b.mu.damage_received / b.mu.battles)
        );
      case "hits":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.hits / a.mu.battles - b.mu.hits / b.mu.battles)
        );
      case "kills":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.frags / a.mu.battles - b.mu.frags / b.mu.battles)
        );
      case "shots":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.shots / a.mu.battles - b.mu.shots / b.mu.battles)
        );
      case "players":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.samples[playerCountPeriod] - b.samples[playerCountPeriod])
        );
      case "spots":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.spotted / a.mu.battles - b.mu.spotted / b.mu.battles)
        );
      case "survival":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.survived_battles / a.mu.battles -
              b.mu.survived_battles / b.mu.battles)
        );
      case "winrate":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction *
            (a.mu.wins / a.mu.battles - b.mu.wins / b.mu.battles)
        );
      case "xp":
        return tanksMapped.sort(
          (a, b) =>
            sort.direction * (a.mu.xp / a.mu.battles - b.mu.xp / b.mu.battles)
        );
    }
  }, [filters, sort]);
  const [loadedRows, setLoadedRows] = useState(DEFAULT_LOADED_ROWS);

  useEffect(() => {
    setLoadedRows(DEFAULT_LOADED_ROWS);
  }, [filters, sort]);

  return (
    <Table.Body>
      <Total tanks={tanksSorted} />

      {tanksSorted.slice(0, loadedRows).map((averages) => {
        const tank = tankDefinitions.tanks[averages.id];

        if (tank === undefined) return null;

        return (
          <Fragment key={tank.id}>
            <Suspense fallback={<RowLoader />}>
              <TankRow tank={tank} />
            </Suspense>
          </Fragment>
        );
      })}

      {times(
        Math.min(PREVIEW_COUNT, tanksSorted.length - loadedRows),
        (index) => {
          return (
            <RowLoader
              key={index}
              onIntersection={() => {
                setLoadedRows((state) =>
                  Math.min(state + 2, tanksSorted.length)
                );
              }}
            />
          );
        }
      )}
    </Table.Body>
  );
}
