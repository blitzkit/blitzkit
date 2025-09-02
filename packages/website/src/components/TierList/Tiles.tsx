import { metaSortTank } from "@blitzkit/core";
import { times } from "lodash-es";
import { useMemo, useState } from "react";
import { awaitableGameDefinitions } from "../../core/awaitables/gameDefinitions";
import { awaitableTankDefinitions } from "../../core/awaitables/tankDefinitions";
import { filterTank } from "../../core/blitzkit/filterTank";
import { TankFilters } from "../../stores/tankFilters";
import { TierList } from "../../stores/tierList";
import { SkeletonTankCard } from "../TankSearch/components/SkeletonTankCard";
import { TankCardWrapper } from "../TankSearch/components/TankCardWrapper";
import { TierListTile } from "./Tile";

const [tankDefinitions, gameDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableGameDefinitions,
]);

const tanks = Object.values(tankDefinitions.tanks);

const PREVIEW_COUNT = 32;
const DEFAULT_LOADED_CARDS = 75;

export function TierListTiles() {
  const filters = TankFilters.use();
  const placedTanks = TierList.use((state) => state.placedTanks);
  const sorted = useMemo(
    () =>
      metaSortTank(
        tanks.filter(
          (tank) => filterTank(filters, tank) && !placedTanks.has(tank.id)
        ),
        gameDefinitions
      ).reverse(),
    [filters, placedTanks]
  );
  const [loadedTiles, setLoadedTiles] = useState(DEFAULT_LOADED_CARDS);

  return (
    <TankCardWrapper>
      {sorted.slice(0, loadedTiles).map((tank) => (
        <TierListTile key={tank.id} tank={tank} />
      ))}

      {times(Math.min(PREVIEW_COUNT, sorted.length - loadedTiles), (index) => {
        return (
          <SkeletonTankCard
            key={index}
            onIntersection={() => {
              setLoadedTiles((state) => Math.min(state + 2, sorted.length));
            }}
          />
        );
      })}
    </TankCardWrapper>
  );
}
