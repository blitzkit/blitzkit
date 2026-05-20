import fuzzysort from "fuzzysort";
import { useMemo } from "react";
import { api } from "../../../api/dynamic";
import { IncrementalLoader } from "../../../components/IncrementalLoader";
import { TankCard } from "../../../components/TankCard";
import { TankCards } from "../../../components/TankCards";
import { TankSearch } from "../../../components/TankSearch";
import { withLocale } from "../../../hocs/withLocale";
import { useAwait } from "../../../hooks/useAwait";
import { useSearchableTanks } from "../../../hooks/useSearchableTanks";
import { useTierCompare } from "../../../hooks/useTierCompare";
import { TankFilters } from "../../../stores/tankFilters";

const { go } = fuzzysort;

export const Page = withLocale(() => {
  const tanks = useAwait(() => api.tanks(), "tanks");

  const compareTiers = useTierCompare();
  const searchableTanks = useSearchableTanks();
  const search = TankFilters.use((state) => state.search);

  const tanksOrdered = useMemo(() => {
    let list = Object.values(tanks.tanks);

    list = list.sort((a, b) => a.tank!.tank_type - b.tank!.tank_type);
    list = list.sort((a, b) => a.tank!.tank_class - b.tank!.tank_class);
    list = list.sort((a, b) => a.tank!.nation - b.tank!.nation);
    list = list.sort((a, b) =>
      compareTiers(a.tank!.tier_catalog_id, b.tank!.tier_catalog_id),
    );

    return list.map(({ id }) => id);
  }, []);
  const tanksFiltered = useMemo(() => {
    if (!search) return tanksOrdered;

    const results = go(search, searchableTanks, {
      keys: ["id", "name", "deburred"],
    });

    return results.map(({ obj }) => obj.id);
  }, [search]);

  return (
    <>
      <TankSearch />
      <List tanks={tanksFiltered} />
    </>
  );
});

interface ListProps {
  tanks: string[];
}

function List({ tanks }: ListProps) {
  const data = useMemo(() => tanks.map((id) => ({ key: id, id })), [tanks]);

  return (
    <TankCards>
      <IncrementalLoader
        initial={7 * 5}
        intermediate={7 * 3}
        data={data}
        Component={TankCard}
      />
    </TankCards>
  );
}
