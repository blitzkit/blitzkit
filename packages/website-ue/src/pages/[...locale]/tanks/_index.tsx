import fuzzysort from "fuzzysort";
import { useMemo } from "react";
import { TankCard } from "../../../components/TankCard";
import { TankCards } from "../../../components/TankCards";
import { TankSearch } from "../../../components/TankSearch";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";
import { LocaleProvider } from "../../../hooks/useLocale";
import { useSearchableTanks } from "../../../hooks/useSearchableTanks";
import { useTierCompare } from "../../../hooks/useTierCompare";
import { TankFilters } from "../../../stores/tankFilters";

const { go } = fuzzysort;

interface PageProps {
  locale: string;
}

export function Page({ locale, ...props }: PageProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

function Content() {
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

    return list;
  }, []);
  const tanksFiltered = useMemo(() => {
    if (!search) return tanksOrdered;

    const results = go(search, searchableTanks, {
      keys: ["id", "name", "deburred"],
    });

    return results.map(({ obj }) => obj);
  }, [search]);

  return (
    <>
      <TankSearch />
      <TankCards>
        {tanksFiltered.slice(0, 32).map(({ id }) => (
          <TankCard key={id} id={id} />
        ))}
      </TankCards>
    </>
  );
}
