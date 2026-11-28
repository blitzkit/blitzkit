import { tankIcon } from "@blitzkit/core";
import {
  TankType,
  type AverageDefinitionsAllStats,
  type TankDefinition,
} from "@blitzkit/protos";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../../api/dynamic";
import {
  performanceStatNames,
  performanceStats,
  type PerformanceEntry,
  type PerformanceStatName,
} from "../../config/performanceStats";
import { awaitableAverageDefinitions } from "../../core/awaitables/averageDefinitions";
import { awaitableDiscoveredIdsDefinitions } from "../../core/awaitables/discoveredIdsDefinitions";
import { filterTanks } from "../../core/blitzkit/filterTanks";
import { useLocale } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { App } from "../../stores/app";
import { Performance } from "../../stores/performance";
import { TankFilters } from "../../stores/tankFilters";
import { SortDirection } from "../../stores/tankopediaPersistent";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { ClassIcon } from "../ClassIcon";
import { EmptyState } from "../EmptyState";
import { ExperimentIcon } from "../ExperimentIcon";
import { IncrementalLoader } from "../IncrementalLoader";
import { InlineSkeleton } from "../InlineSkeleton";
import { LazyImage } from "../LazyImage";
import { LinkI18n } from "../LinkI18n";
import { Skeleton } from "../Skeleton";
import { Table } from "../Table";
import { Text } from "../Text";
import styles from "./index.module.css";

const [tankDefinitions, averageDefinitions, discoveredIdsDefinitions] =
  await Promise.all([
    api.tanks(),
    awaitableAverageDefinitions,
    awaitableDiscoveredIdsDefinitions,
  ]);

// Only tanks with statistics can be listed
const tanksWithAverages = Object.values(tankDefinitions.tanks).filter(
  ({ id }) => id in averageDefinitions.averages,
);

// Samples only cover part of the discovered players, so player counts are scaled up to all of them
const exclusionRatio =
  discoveredIdsDefinitions.count / averageDefinitions.samples!.total;

interface PerformanceRow {
  tank: TankDefinition;
  entry: PerformanceEntry;
  values: Record<PerformanceStatName, number>;
}

function computeValues(entry: PerformanceEntry) {
  const values = {} as Record<PerformanceStatName, number>;

  for (const name of performanceStatNames) {
    values[name] = performanceStats[name].value(entry);
  }

  return values;
}

export function PerformanceTable() {
  const strings = useStrings();
  const filters = TankFilters.use();
  const wargaming = App.use((state) => state.logins.wargaming);
  const [filtered, setFiltered] = useState<TankDefinition[] | null>(null);

  // Filtering can wait on the player's garage, so the last results stay up until it settles
  useEffect(() => {
    let cancelled = false;

    filterTanks(filters, tanksWithAverages, wargaming?.id).then((tanks) => {
      if (!cancelled) setFiltered(tanks);
    });

    return () => {
      cancelled = true;
    };
  }, [filters, wargaming?.id]);

  if (filtered !== null && filtered.length === 0) {
    return (
      <EmptyState
        title={strings.performance.no_tanks.title}
        body={strings.performance.no_tanks.body}
      />
    );
  }

  return (
    <Table.Root>
      <Head />
      <Body filtered={filtered} />
    </Table.Root>
  );
}

function Head() {
  return (
    <Table.Head>
      <Table.Row>
        <Table.IconCorner />

        {performanceStatNames.map((name) => (
          <ColumnHeader key={name} name={name} />
        ))}
      </Table.Row>
    </Table.Head>
  );
}

interface BodyProps {
  filtered: TankDefinition[] | null;
}

// Owns sorting and period, so changing them never re-renders the head
function Body({ filtered }: BodyProps) {
  const sorting = Performance.use((state) => state.sorting);
  const period = Performance.use((state) => state.player_count_period);

  const rows = useMemo(() => {
    if (filtered === null) return null;

    return filtered.map((tank) => {
      const average = averageDefinitions.averages[tank.id];
      const entry = {
        stats: average.mu!,
        players: exclusionRatio * average.samples![period],
      } satisfies PerformanceEntry;

      return {
        tank,
        entry,
        values: computeValues(entry),
      } satisfies PerformanceRow;
    });
  }, [filtered, period]);

  // Every tank's stats weighted by how many players it had in the period
  const total = useMemo(() => {
    if (rows === null) return null;

    const stats = {} as AverageDefinitionsAllStats;
    let samples = 0;

    for (const { tank } of rows) {
      const average = averageDefinitions.averages[tank.id];
      const weight = average.samples![period];

      samples += weight;

      for (const key in average.mu!) {
        const stat = key as keyof AverageDefinitionsAllStats;

        stats[stat] = (stats[stat] ?? 0) + weight * average.mu![stat];
      }
    }

    return computeValues({ stats, players: exclusionRatio * samples });
  }, [rows, period]);

  const sorted = useMemo(() => {
    if (rows === null) return null;

    const direction = sorting.direction === SortDirection.Ascending ? 1 : -1;

    return [...rows].sort(
      (a, b) => direction * (a.values[sorting.by] - b.values[sorting.by]),
    );
  }, [rows, sorting]);

  const data = useMemo(
    () =>
      (sorted ?? []).map((row) => ({
        key: `${row.tank.id}`,
        row,
        total: total!,
      })),
    [sorted, total],
  );

  return (
    <Table.Body>
      <TotalRow total={total} />

      <IncrementalLoader
        skeleton={sorted === null}
        initial={32}
        intermediate={8}
        data={data}
        Component={Row}
      />
    </Table.Body>
  );
}

interface TotalRowProps {
  total: Record<PerformanceStatName, number> | null;
}

function TotalRow({ total }: TotalRowProps) {
  const strings = useStrings();

  return (
    <Table.Row>
      <Table.RowHeader>{strings.performance.total}</Table.RowHeader>

      {performanceStatNames.map((name) => (
        <Table.Cell key={name}>
          {total === null ? (
            <Skeleton className={styles["value-skeleton"]} />
          ) : (
            <Value name={name} value={total[name]} />
          )}
        </Table.Cell>
      ))}
    </Table.Row>
  );
}

interface ColumnHeaderProps {
  name: PerformanceStatName;
}

function ColumnHeader({ name }: ColumnHeaderProps) {
  const strings = useStrings();
  const sorting = Performance.use((state) => state.sorting);

  return (
    <Table.ColumnHeaderSortable
      direction={sorting.by === name ? sorting.direction : undefined}
      onSort={() => {
        Performance.mutate((draft) => {
          const ascending =
            draft.sorting.by === name &&
            draft.sorting.direction === SortDirection.Descending;

          draft.sorting = {
            by: name,
            direction: ascending
              ? SortDirection.Ascending
              : SortDirection.Descending,
          };
        });
      }}
    >
      {strings.common.stats[name]}
    </Table.ColumnHeaderSortable>
  );
}

interface ValueProps {
  name: PerformanceStatName;
  value: number;
}

function Value({ name, value }: ValueProps) {
  const locale = useLocale();

  return (
    <Text className={styles.value}>
      {Number.isFinite(value)
        ? performanceStats[name].format(value, locale)
        : "-"}
    </Text>
  );
}

interface RowProps {
  row: PerformanceRow;
  total: Record<PerformanceStatName, number>;
}

// Memoized so loading more rows leaves the loaded ones be
const Row = memo((props: MaybeSkeletonComponentProps<RowProps>) => {
  if (props.skeleton) {
    return <SkeletonRow onIntersection={props.onIntersection} />;
  }

  const { row, total } = props;

  return (
    <Table.Row>
      <Table.RowHeader>
        <TankLink tank={row.tank} />
      </Table.RowHeader>

      {performanceStatNames.map((name) => (
        <Table.CellRanked
          key={name}
          ranking={performanceStats[name].ranking}
          value={row.values[name]}
          truth={total[name]}
        >
          <Value name={name} value={row.values[name]} />
        </Table.CellRanked>
      ))}
    </Table.Row>
  );
});

interface TankLinkProps {
  tank: TankDefinition;
}

function TankLink({ tank }: TankLinkProps) {
  const locale = useLocale();
  const unwrap = useUnwrapper();
  const name = unwrap(tank.name!);

  return (
    <LinkI18n
      locale={locale}
      href={`/tanks/${tank.slug}`}
      underline="hover"
      className={styles.tank}
      color={
        tank.type === TankType.TANK_TYPE_COLLECTOR
          ? "blue"
          : tank.type === TankType.TANK_TYPE_PREMIUM
          ? "amber"
          : "gray"
      }
      highContrast={tank.type === TankType.TANK_TYPE_RESEARCHABLE}
    >
      <LazyImage
        alt={name}
        src={tankIcon(tank.id)}
        draggable={false}
        className={styles.icon}
      />

      <ClassIcon class={tank.class} className={styles.glyph} />
      {tank.testing && <ExperimentIcon className={styles.glyph} />}

      <span className={styles.name}>{name}</span>
    </LinkI18n>
  );
}

interface SkeletonRowProps {
  onIntersection?: () => void;
}

function SkeletonRow({ onIntersection }: SkeletonRowProps) {
  const row = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!onIntersection) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onIntersection();
    });

    observer.observe(row.current!);

    return () => observer.disconnect();
  }, []);

  return (
    <Table.Row ref={row}>
      <Table.RowHeader>
        <InlineSkeleton className={styles["tank-skeleton"]} />
      </Table.RowHeader>

      {performanceStatNames.map((name) => (
        <Table.Cell key={name}>
          <InlineSkeleton className={styles["value-skeleton"]} />
        </Table.Cell>
      ))}
    </Table.Row>
  );
}
