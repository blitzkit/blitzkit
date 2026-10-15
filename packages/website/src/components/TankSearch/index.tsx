import { metaSortTank, SEARCH_KEYS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import type { TankDefinition } from "@blitzkit/protos";
import fuzzysort from "fuzzysort";
import { uniq } from "lodash-es";
import { memo, useMemo } from "react";
import usePromise from "react-promise-suspense";
import { api } from "../../api/dynamic";
import { characteristics } from "../../config/characteristics";
import { characteristicRenderConfigs } from "../../config/characteristicsGroups";
import { awaitableTankNames } from "../../core/awaitables/tankNames";
import { filterTanks } from "../../core/blitzkit/filterTanks";
import { useCharacteristicRenderer } from "../../hooks/useCharacteristicRenderer";
import { computeDefaultCharacteristics } from "../../hooks/useCharacteristics";
import { useLocale } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { App } from "../../stores/app";
import { TankFilters } from "../../stores/tankFilters";
import {
  TankopediaPersistent,
  TankopediaSortDirection,
} from "../../stores/tankopediaPersistent";
import { TankSort } from "../../stores/tankopediaSort";
import { sortableCharacteristics } from "../../tankopedia/sortableCharacteristics";
import {
  CharacteristicType,
  type ComputedCharacteristics,
} from "../../types/characteristics";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { Callout } from "../Callout";
import { ExperimentIcon } from "../ExperimentIcon";
import { Flex } from "../Flex";
import { IncrementalLoader } from "../IncrementalLoader";
import { Link } from "../Link";
import { RecentlyViewedTanks } from "../RecentlyViewedTanks";
import { TankCard } from "../TankCard";
import { TankCardWrapper } from "../TankCardWrapper";
import { TankSearchBar } from "../TankSearchBar";
import { TankSearchFilters } from "../TankSearchFilters";
import { TankSearchNoResults } from "../TankSearchNoResults";
import { Text } from "../Text";
import { MAX_RECENTLY_VIEWED } from "./constants";
import styles from "./index.module.css";

export type TankSearchProps = MaybeSkeletonComponentProps & {
  compact?: boolean;
  onSelect?: (tank: TankDefinition) => void;
  onSelectAll?: (tanks: TankDefinition[]) => void;
};

const [gameDefinitions, tankDefinitions, tankNames] = await Promise.all([
  api.game(),
  api.tanks(),
  awaitableTankNames,
]);
const tankDefinitionsArray = Object.values(tankDefinitions.tanks);

export const TankSearch = memo<TankSearchProps>(
  ({ compact, onSelect, onSelectAll, skeleton }) => {
    const strings = useStrings();
    const locale = useLocale();

    const wargaming = App.use((state) => state.logins.wargaming);

    const tankopediaSort = TankSort.use();
    const tankFilters = TankFilters.use();

    const defaultCharacteristics = useMemo(() => {
      const computed = new Map<number, ComputedCharacteristics>();

      for (const tank of tankDefinitionsArray) {
        computed.set(tank.id, computeDefaultCharacteristics(tank));
      }

      return computed;
    }, []);

    const filtered = usePromise(
      async () => {
        let filtered = tankDefinitionsArray;

        console.log("A");

        if (tankopediaSort.by !== null) {
          console.log("B", filtered.length);

          filtered = filtered.filter((tank) =>
            defaultCharacteristics.get(tank.id)!.has(tankopediaSort.by!),
          );

          console.log("C", filtered.length);
        }

        if (tankFilters.search === null) {
          filtered = await filterTanks(tankFilters, filtered, wargaming?.id);
        } else {
          filtered = fuzzysort
            .go(tankFilters.search, tankNames, { keys: SEARCH_KEYS })
            .map((result) => tankDefinitions.tanks[result.obj.id]);
        }

        return filtered;
      },
      // react-promise-suspense has awful type annotations
      [tankFilters, tankopediaSort.by] as any,
    );

    const sorted = useMemo(() => {
      if (tankFilters.search !== null) return filtered;

      if (
        tankopediaSort.by === null ||
        !sortableCharacteristics.has(tankopediaSort.by)
      ) {
        const byMeta = metaSortTank([...filtered], gameDefinitions);

        return tankopediaSort.direction === TankopediaSortDirection.Ascending
          ? byMeta
          : byMeta.reverse();
      }

      const values = new Map<number, number | undefined>();
      const by = tankopediaSort.by;
      const characteristic = characteristics[by];

      for (const tank of filtered) {
        const computedCharacteristics = defaultCharacteristics.get(tank.id)!;
        if (!computedCharacteristics.has(by)) {
          values.set(tank.id, undefined);
          continue;
        }

        const value = computedCharacteristics.get(by);

        let sortValue: number | undefined;

        switch (characteristic.type) {
          case CharacteristicType.Number: {
            sortValue = value as number;

            break;
          }

          case CharacteristicType.NumberList: {
            const values = value as number[];
            if (values.length === 0) {
              sortValue = undefined;
              break;
            }

            let sum = 0;

            for (const item of values) {
              sum += item;
            }

            sortValue = sum / values.length;

            break;
          }

          default:
            throw new Error(
              `Unsortable characteristic type ${characteristic.type}`,
            );
        }

        values.set(tank.id, sortValue);
      }

      const direction =
        tankopediaSort.direction === TankopediaSortDirection.Ascending ? 1 : -1;

      return [...filtered].sort((a, b) => {
        const aValue = values.get(a.id);
        const bValue = values.get(b.id);

        if (aValue === undefined) return bValue === undefined ? 0 : 1;
        if (bValue === undefined) return -1;

        if (aValue === bValue) return 0;

        return (aValue < bValue ? -1 : 1) * direction;
      });
    }, [tankFilters, tankopediaSort]);

    console.log("V", sorted.length);

    const sortConfig =
      tankopediaSort.by !== null &&
      sortableCharacteristics.has(tankopediaSort.by)
        ? tankopediaSort.by
        : undefined;

    const renderCharacteristic = useCharacteristicRenderer();

    const data = sorted.map((tank) => {
      const tankDefaultCharacteristics = defaultCharacteristics.get(tank.id)!;
      const shouldRenderDiscriminator =
        tankopediaSort.by !== null &&
        tankDefaultCharacteristics.has(tankopediaSort.by);

      return {
        key: `${tank.id}`,
        tank,
        discriminator: shouldRenderDiscriminator
          ? renderCharacteristic(
              tankDefaultCharacteristics.get(tankopediaSort.by!)!,
              characteristicRenderConfigs.get(tankopediaSort.by!)!,
            )
          : null,
        onTankSelect: onSelect,
      };
    });

    return (
      <Flex className={styles.container} column gap="4">
        <TankSearchBar
          skeleton={skeleton}
          topResult={sorted[0]}
          onSelect={onSelect}
        />

        {!tankFilters.search && <TankSearchFilters />}

        {!skeleton && !compact && <RecentlyViewedTanks />}

        {sorted.length > 0 && (
          <Flex justify="center" className={styles.label}>
            <div className={styles.count}>
              <Text lowContrast>
                {sorted.length === 1
                  ? strings.website.common.tank_search.count_singular
                  : literals(strings.website.common.tank_search.count_plural, {
                      count: sorted.length.toLocaleString(locale),
                    })}
              </Text>

              {onSelectAll && (
                <Link
                  underline="always"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    onSelectAll(sorted);
                    TankopediaPersistent.mutate((draft) => {
                      draft.recentlyViewed = uniq([
                        ...sorted.map(({ id }) => id),
                        ...draft.recentlyViewed,
                      ])
                        .filter((id) => id in tankDefinitions.tanks)
                        .slice(0, MAX_RECENTLY_VIEWED);
                    });
                  }}
                >
                  {strings.website.common.tank_search.select_all}
                </Link>
              )}
            </div>

            {sortConfig && (
              <Text color="gray">
                {literals(strings.website.common.tank_search.sorting_by, {
                  name: (
                    strings.tanks.characteristics.items as Record<
                      string,
                      string
                    >
                  )[sortConfig],
                })}
                , {tankopediaSort.direction}
              </Text>
            )}
          </Flex>
        )}

        {tankFilters.showTesting && !tankFilters.showNonTesting && (
          <div className={styles["test-warning"]}>
            <Callout color="amber">
              <ExperimentIcon style={{ width: "1em", height: "1em" }} />
              {strings.website.common.warnings.test}
            </Callout>
          </div>
        )}

        <TankCardWrapper>
          <IncrementalLoader
            skeleton={skeleton}
            initial={5 * 5}
            intermediate={5 * 2}
            data={data}
            Component={TankCard}
          />
        </TankCardWrapper>

        {!skeleton && sorted.length === 0 && (
          <TankSearchNoResults type="search" />
        )}
      </Flex>
    );
  },
);
