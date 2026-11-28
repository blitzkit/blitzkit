import { metaSortTanks } from "@blitzkit/core";
import { useMemo } from "react";
import usePromise from "react-promise-suspense";
import { api } from "../../api/dynamic";
import { filterTanks } from "../../core/blitzkit/filterTanks";
import { withLocale } from "../../hocs/withLocale";
import { App } from "../../stores/app";
import { TankFilters } from "../../stores/tankFilters";
import { TierList } from "../../stores/tierList";
import { IncrementalLoader } from "../IncrementalLoader";
import { TankCardWrapper } from "../TankCardWrapper";
import { TankSearchNoResults } from "../TankSearchNoResults";
import { TierListTile } from "../TierListTile";

const [tankDefinitions, gameDefinitions] = await Promise.all([
  api.tanks(),
  api.game(),
]);
const tanks = Object.values(tankDefinitions.tanks);

// Tanks not yet placed in any tier, ready to be dragged in
export const TierListTiles = withLocale(Content);

function Content() {
  const filters = TankFilters.use();
  const rows = TierList.useDeferred(
    (state) => state.rows,
    TierList.initial.rows,
  );
  const wargaming = App.use((state) => state.logins.wargaming);
  const filtered = usePromise(
    () => filterTanks(filters, tanks, wargaming?.id),
    // react-promise-suspense has awful type annotations
    [filters] as any,
  );

  const data = useMemo(() => {
    const placed = new Set(rows.flatMap((row) => row.tanks));
    const unplaced = filtered.filter(({ id }) => !placed.has(id));

    return metaSortTanks(unplaced, gameDefinitions)
      .reverse()
      .map(({ id }) => ({ key: `${id}`, id }));
  }, [filtered, rows]);

  if (data.length === 0) return <TankSearchNoResults />;

  return (
    <TankCardWrapper>
      <IncrementalLoader
        initial={2 ** 6}
        intermediate={2 ** 4}
        data={data}
        Component={TierListTile}
      />
    </TankCardWrapper>
  );
}
