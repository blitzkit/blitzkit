import { useStore } from '@nanostores/react';
import { Table } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Fragment, Suspense, useEffect, useMemo, useState } from 'react';
import { awaitableAverageDefinitions } from '../../core/awaitables/averageDefinitions';
import { awaitableTankDefinitions } from '../../core/awaitables/tankDefinitions';
import { filterTank } from '../../core/blitzkit/filterTank';
import { $tankFilters } from '../../stores/tankFilters';
import { TankPerformanceEphemeral } from '../../stores/tankPerformanceEphemeral';
import { TankPerformanceSort } from '../../stores/tankPerformanceSort';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';
import { RowLoader } from './RowLoader';
import { TankRow } from './TankRow';
import { Total } from './Total';

const PREVIEW_COUNT = 10;
const DEFAULT_LOADED_ROWS = 25;

const [tankDefinitions, averageDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableAverageDefinitions,
]);

const averageDefinitionsArray = Object.entries(averageDefinitions.averages).map(
  ([id, average]) => ({
    id: Number(id),
    ...average,
  }),
);

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
  const tankPerformancePersistentStore = TankPerformanceEphemeral.useStore();
  const filters = useStore($tankFilters);
  const tanksSorted = useMemo(() => {
    const { playerCountPeriod } = tankPerformancePersistentStore.getState();

    switch (sort.type) {
      case 'accuracy':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction * (a.mu.hits / a.mu.shots - b.mu.hits / b.mu.shots),
        );
      case 'capture_points':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.capture_points / a.mu.battles -
              b.mu.capture_points / b.mu.battles),
        );
      case 'damage':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_dealt / a.mu.battles -
              b.mu.damage_dealt / b.mu.battles),
        );
      case 'damage_ratio':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_dealt / a.mu.damage_received -
              b.mu.damage_dealt / b.mu.damage_received),
        );
      case 'damage_taken':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.damage_received / a.mu.battles -
              b.mu.damage_received / b.mu.battles),
        );
      case 'hits':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.hits / a.mu.battles - b.mu.hits / b.mu.battles),
        );
      case 'kills':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.frags / a.mu.battles - b.mu.frags / b.mu.battles),
        );
      case 'shots':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.shots / a.mu.battles - b.mu.shots / b.mu.battles),
        );
      case 'players':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.samples[playerCountPeriod] - b.samples[playerCountPeriod]),
        );
      case 'spots':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.spotted / a.mu.battles - b.mu.spotted / b.mu.battles),
        );
      case 'survival':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.survived_battles / a.mu.battles -
              b.mu.survived_battles / b.mu.battles),
        );
      case 'winrate':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction *
            (a.mu.wins / a.mu.battles - b.mu.wins / b.mu.battles),
        );
      case 'xp':
        return averageDefinitionsArray.sort(
          (a, b) =>
            sort.direction * (a.mu.xp / a.mu.battles - b.mu.xp / b.mu.battles),
        );
    }
  }, [sort]);
  const tanks = useMemo(() => {
    return tanksSorted.filter((tank) =>
      filterTank(filters, tankDefinitions.tanks[tank.id]),
    );
  }, [filters, sort]);
  const [loadedRows, setLoadedRows] = useState(DEFAULT_LOADED_ROWS);

  useEffect(() => {
    setLoadedRows(DEFAULT_LOADED_ROWS);
  }, [filters, sort]);

  return (
    <Table.Body>
      <Total tanks={tanks} />

      {tanks.slice(0, loadedRows).map((averages) => {
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

      {times(Math.min(PREVIEW_COUNT, tanks.length - loadedRows), (index) => {
        return (
          <RowLoader
            key={index}
            onIntersection={() => {
              setLoadedRows((state) => Math.min(state + 2, tanks.length));
            }}
          />
        );
      })}
    </Table.Body>
  );
}
