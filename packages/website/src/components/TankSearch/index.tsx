import {
  metaSortTank,
  normalizeBoundingBox,
  resolveDpm,
  SEARCH_KEYS,
  unionBoundingBox,
  type TankDefinition,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import fuzzysort from "fuzzysort";
import { times, uniq } from "lodash-es";
import { memo, useEffect, useMemo, useState } from "react";
import usePromise from "react-promise-suspense";
import { awaitableTankNames } from "../../core/awaitables/tankNames";
import { api } from "../../core/blitzkit/api";
import { filterTanks } from "../../core/blitzkit/filterTanks";
import { resolveReload } from "../../core/blitzkit/resolveReload";
import { useLocale } from "../../hooks/useLocale";
import { App } from "../../stores/app";
import { TankFilters } from "../../stores/tankFilters";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { SORT_UNITS } from "../../stores/tankopediaPersistent/constants";
import { TankSort } from "../../stores/tankopediaSort";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { Callout } from "../Callout";
import { ExperimentIcon } from "../ExperimentIcon";
import { Flex } from "../Flex";
import { Link } from "../Link";
import { RecentlyViewedTanks } from "../RecentlyViewedTanks";
import { TankCardSkeleton } from "../TankCardSkeleton";
import { TankCardWrapper } from "../TankCardWrapper";
import { TankSearchBar } from "../TankSearchBar";
import { TankSearchFilters } from "../TankSearchFilters";
import { TankSearchNoResults } from "../TankSearchNoResults";
import { Text } from "../Text";
import { TankSearchCard } from "./components/Card";
import { MAX_RECENTLY_VIEWED } from "./constants";
import styles from "./index.module.css";

export type TankSearchProps = MaybeSkeletonComponentProps & {
  compact?: boolean;
  onSelect?: (tank: TankDefinition) => void;
  onSelectAll?: (tanks: TankDefinition[]) => void;
};

const PREVIEW_COUNT = 20;
const DEFAULT_LOADED_CARDS = 64;

const [gameDefinitions, modelDefinitions, tankDefinitions, tankNames] =
  await Promise.all([
    api.gameDefinitions(),
    api.modelDefinitions(),
    api.tankDefinitions(),
    awaitableTankNames,
  ]);

export const TankSearch = memo<TankSearchProps>(
  ({ compact, onSelect, onSelectAll, skeleton }) => {
    const { strings, locale } = useLocale();
    const wargaming = App.use((state) => state.logins.wargaming);
    const awaitedTanksDefinitionsArray = Object.values(tankDefinitions.tanks);
    const tankopediaSort = TankSort.use();
    const tankFilters = TankFilters.use();

    const filtered = usePromise(
      () => {
        if (tankFilters.search === null) {
          return filterTanks(
            tankFilters,
            awaitedTanksDefinitionsArray,
            wargaming?.id,
          );
        } else {
          return Promise.resolve(
            fuzzysort
              .go(tankFilters.search, tankNames, { keys: SEARCH_KEYS })
              .map((result) => tankDefinitions.tanks[result.obj.id]),
          );
        }
      },
      // react-promise-suspense has awful type annotations
      [tankFilters] as any,
    );
    const sorted = useMemo(() => {
      if (tankFilters.search === null) {
        let sorted: TankDefinition[];

        switch (tankopediaSort.by) {
          case "meta.none":
            sorted = metaSortTank(filtered, gameDefinitions);
            break;

          case "survivability.health": {
            sorted = filtered.sort((a, b) => {
              const aHealth = a.health + a.turrets.at(-1)!.health;
              const bHealth = b.health + b.turrets.at(-1)!.health;

              return aHealth - bHealth;
            });
            break;
          }

          case "survivability.viewRange":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.view_range - b.turrets.at(-1)!.view_range,
            );
            break;

          case "survivability.camouflageStill":
            sorted = filtered.sort(
              (a, b) => a.camouflage_still - b.camouflage_still,
            );
            break;

          case "survivability.camouflageMoving":
            sorted = filtered.sort(
              (a, b) => a.camouflage_moving - b.camouflage_moving,
            );
            break;

          case "survivability.camouflageShooting":
            sorted = filtered.sort(
              (a, b) =>
                a.camouflage_still *
                  a.turrets.at(-1)!.guns.at(-1)!.camouflage_loss -
                b.camouflage_still *
                  b.turrets.at(-1)!.guns.at(-1)!.camouflage_loss,
            );
            break;

          case "survivability.volume":
            sorted = filtered.sort((a, b) => {
              const aTankModelDefinition = modelDefinitions.models[a.id];
              const bTankModelDefinition = modelDefinitions.models[b.id];
              const aTurretModelDefinition =
                aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
              const bTurretModelDefinition =
                bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
              const aSize = normalizeBoundingBox(
                unionBoundingBox(
                  aTankModelDefinition.bounding_box!,
                  aTurretModelDefinition.bounding_box!,
                ),
              );
              const bSize = normalizeBoundingBox(
                unionBoundingBox(
                  bTankModelDefinition.bounding_box!,
                  bTurretModelDefinition.bounding_box!,
                ),
              );
              const aVolume = aSize.x * aSize.y * aSize.z;
              const bVolume = bSize.x * bSize.y * bSize.z;

              return aVolume - bVolume;
            });
            break;

          case "survivability.length":
            sorted = filtered.sort((a, b) => {
              const aTankModelDefinition = modelDefinitions.models[a.id];
              const bTankModelDefinition = modelDefinitions.models[b.id];
              const aTurretModelDefinition =
                aTankModelDefinition.turrets[a.turrets.at(-1)!.id];
              const bTurretModelDefinition =
                bTankModelDefinition.turrets[b.turrets.at(-1)!.id];
              const aSize = normalizeBoundingBox(
                unionBoundingBox(
                  aTankModelDefinition.bounding_box!,
                  aTurretModelDefinition.bounding_box!,
                ),
              );
              const bSize = normalizeBoundingBox(
                unionBoundingBox(
                  bTankModelDefinition.bounding_box!,
                  bTurretModelDefinition.bounding_box!,
                ),
              );
              const aLength = Math.max(aSize.x, aSize.y, aSize.z);
              const bLength = Math.max(bSize.x, bSize.y, bSize.z);

              return aLength - bLength;
            });
            break;

          case "fire.dpm":
            sorted = filtered.sort(
              (a, b) =>
                resolveDpm(
                  a.turrets.at(-1)!.guns.at(-1)!,
                  a.turrets.at(-1)!.guns.at(-1)!.shells[0],
                ) -
                resolveDpm(
                  b.turrets.at(-1)!.guns.at(-1)!,
                  b.turrets.at(-1)!.guns.at(-1)!.shells[0],
                ),
            );
            break;

          case "fire.dpmPremium":
            sorted = filtered.sort(
              (a, b) =>
                (a.turrets.at(-1)!.guns.at(-1)!.shells[1]
                  ? resolveDpm(
                      a.turrets.at(-1)!.guns.at(-1)!,
                      a.turrets.at(-1)!.guns.at(-1)!.shells[1],
                    )
                  : 0) -
                (b.turrets.at(-1)!.guns.at(-1)!.shells[1]
                  ? resolveDpm(
                      b.turrets.at(-1)!.guns.at(-1)!,
                      b.turrets.at(-1)!.guns.at(-1)!.shells[1],
                    )
                  : 0),
            );
            break;

          case "fire.reload":
            sorted = filtered.sort(
              (a, b) =>
                resolveReload(a.turrets.at(-1)!.guns.at(-1)!) -
                resolveReload(b.turrets.at(-1)!.guns.at(-1)!),
            );
            break;

          case "fire.caliber":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.shells[0].caliber -
                b.turrets.at(-1)!.guns.at(-1)!.shells[0].caliber,
            );
            break;

          case "fire.standardPenetration":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration!.near -
                b.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration!.near,
            );
            break;

          case "fire.premiumPenetration":
            sorted = filtered.sort(
              (a, b) =>
                (a.turrets.at(-1)!.guns.at(-1)!.shells[1]?.penetration!.near ??
                  0) -
                (b.turrets.at(-1)!.guns.at(-1)!.shells[1]?.penetration!.near ??
                  0),
            );
            break;

          case "fire.tertiaryPenetration":
            sorted = filtered.sort(
              (a, b) =>
                (a.turrets.at(-1)!.guns.at(-1)!.shells[2]?.penetration!.near ??
                  0) -
                (b.turrets.at(-1)!.guns.at(-1)!.shells[2]?.penetration!.near ??
                  0),
            );
            break;

          case "fire.damage":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.shells[0].armor_damage -
                b.turrets.at(-1)!.guns.at(-1)!.shells[0].armor_damage,
            );
            break;

          case "fire.moduleDamage":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.shells[0].module_damage -
                b.turrets.at(-1)!.guns.at(-1)!.shells[0].module_damage,
            );
            break;

          case "fire.shellVelocity":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.shells[0].velocity -
                b.turrets.at(-1)!.guns.at(-1)!.shells[0].velocity,
            );
            break;

          case "fire.shellRange":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.shells[0].range -
                b.turrets.at(-1)!.guns.at(-1)!.shells[0].range,
            );
            break;

          case "fire.shellCapacity":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.shell_capacity -
                b.turrets.at(-1)!.guns.at(-1)!.shell_capacity,
            );
            break;

          case "fire.aimTime":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.aim_time -
                b.turrets.at(-1)!.guns.at(-1)!.aim_time,
            );
            break;

          case "fire.dispersionStill":
            sorted = filtered.sort(
              (a, b) =>
                a.turrets.at(-1)!.guns.at(-1)!.dispersion_base -
                b.turrets.at(-1)!.guns.at(-1)!.dispersion_base,
            );
            break;

          case "fire.dispersionMoving":
            sorted = filtered.sort(
              (a, b) =>
                a.tracks.at(-1)!.dispersion_move -
                b.tracks.at(-1)!.dispersion_move,
            );
            break;

          case "fire.gunDepression":
            sorted = filtered.sort(
              (a, b) =>
                modelDefinitions.models[a.id].turrets[a.turrets.at(-1)!.id]
                  .guns[a.turrets.at(-1)!.guns.at(-1)!.id].pitch!.max +
                (modelDefinitions.models[a.id].initial_turret_rotation?.pitch ??
                  0) -
                modelDefinitions.models[b.id].turrets[b.turrets.at(-1)!.id]
                  .guns[b.turrets.at(-1)!.guns.at(-1)!.id].pitch!.max -
                (modelDefinitions.models[b.id].initial_turret_rotation?.pitch ??
                  0),
            );
            break;

          case "fire.gunElevation":
            sorted = filtered.sort(
              (a, b) =>
                modelDefinitions.models[b.id].turrets[b.turrets.at(-1)!.id]
                  .guns[b.turrets.at(-1)!.guns.at(-1)!.id].pitch!.min +
                (modelDefinitions.models[b.id].initial_turret_rotation?.pitch ??
                  0) -
                modelDefinitions.models[a.id].turrets[a.turrets.at(-1)!.id]
                  .guns[a.turrets.at(-1)!.guns.at(-1)!.id].pitch!.min -
                (modelDefinitions.models[a.id].initial_turret_rotation?.pitch ??
                  0),
            );
            break;

          case "maneuverability.forwardsSpeed":
            sorted = filtered.sort(
              (a, b) => a.speed_forwards - b.speed_forwards,
            );
            break;

          case "maneuverability.backwardsSpeed":
            sorted = filtered.sort(
              (a, b) => a.speed_backwards - b.speed_backwards,
            );
            break;

          case "maneuverability.power":
            sorted = filtered.sort(
              (a, b) => a.engines.at(-1)!.power - b.engines.at(-1)!.power,
            );
            break;

          case "maneuverability.powerToWeight":
            sorted = filtered.sort(
              (a, b) =>
                a.engines.at(-1)!.power /
                  (a.weight +
                    a.engines.at(-1)!.weight +
                    a.tracks.at(-1)!.weight +
                    a.turrets.at(-1)!.weight +
                    a.turrets.at(-1)!.guns.at(-1)!.weight) -
                b.engines.at(-1)!.power /
                  (b.weight +
                    b.engines.at(-1)!.weight +
                    b.tracks.at(-1)!.weight +
                    b.turrets.at(-1)!.weight +
                    b.turrets.at(-1)!.guns.at(-1)!.weight),
            );
            break;

          case "maneuverability.weight":
            sorted = filtered.sort(
              (a, b) =>
                a.weight +
                a.engines.at(-1)!.weight +
                a.tracks.at(-1)!.weight +
                a.turrets.at(-1)!.weight +
                a.turrets.at(-1)!.guns.at(-1)!.weight -
                (b.weight +
                  b.engines.at(-1)!.weight +
                  b.tracks.at(-1)!.weight +
                  b.turrets.at(-1)!.weight +
                  b.turrets.at(-1)!.guns.at(-1)!.weight),
            );
            break;

          case "maneuverability.traverseSpeed":
            sorted = filtered.sort(
              (a, b) =>
                a.tracks.at(-1)!.traverse_speed -
                b.tracks.at(-1)!.traverse_speed,
            );
            break;
        }

        return tankopediaSort.direction === "ascending"
          ? sorted
          : sorted.reverse();
      } else {
        return filtered;
      }
    }, [tankFilters, tankopediaSort]);

    const [loadedCards, setLoadedCards] = useState(DEFAULT_LOADED_CARDS);
    const tanks = sorted.slice(0, loadedCards);

    useEffect(() => {
      setLoadedCards(DEFAULT_LOADED_CARDS);
    }, [tankFilters, tankopediaSort]);

    return (
      <Flex className={styles.container} column gap="4">
        <TankSearchBar
          skeleton={skeleton}
          topResult={tanks?.[0]}
          onSelect={onSelect}
        />

        {!tankFilters.search && <TankSearchFilters />}

        {!skeleton && !compact && <RecentlyViewedTanks />}

        {tanks.length > 0 && (
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

            {tankopediaSort.by !== "meta.none" && (
              <Text color="gray">
                {literals(strings.website.common.tank_search.sorting_by, {
                  name: strings.website.common.tank_search.sort[
                    tankopediaSort.by
                  ],
                })}
                {SORT_UNITS[tankopediaSort.by] === undefined
                  ? ""
                  : ` (${SORT_UNITS[tankopediaSort.by]})`}
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

        {!skeleton && (
          <>
            {tanks.length > 0 && (
              <TankCardWrapper>
                {tanks.map((tank) => (
                  <TankSearchCard
                    tank={tank}
                    key={tank.id}
                    onSelect={onSelect}
                  />
                ))}

                {times(
                  Math.min(PREVIEW_COUNT, sorted.length - loadedCards),
                  (index) => {
                    return (
                      <TankCardSkeleton
                        key={index}
                        onIntersection={() => {
                          setLoadedCards((state) =>
                            Math.min(state + 2, sorted.length),
                          );
                        }}
                      />
                    );
                  },
                )}
              </TankCardWrapper>
            )}

            {tanks.length === 0 && <TankSearchNoResults type="search" />}
          </>
        )}
      </Flex>
    );
  },
);
