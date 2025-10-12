import { metaSortTank } from "@blitzkit/core";
import { times } from "lodash-es";
import { useMemo, useState } from "react";
import usePromise from "react-promise-suspense";
import { awaitableGameDefinitions } from "../../core/awaitables/gameDefinitions";
import { awaitableTankDefinitions } from "../../core/awaitables/tankDefinitions";
import { filterTanks } from "../../core/blitzkit/filterTanks";
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
  const filteredTanks = usePromise(
    () =>
      filterTanks(filters, tanks).then((tanks) =>
        tanks.filter(({ id }) => !placedTanks.has(id))
      ),
    // react-promise-suspense has awful type annotations
    [filters, placedTanks] as any
  );
  const sorted = useMemo(
    () => metaSortTank(filteredTanks, gameDefinitions).reverse(),
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
