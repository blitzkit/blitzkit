import { useMemo } from "react";
import { TankCard } from "../../../components/TankCard";
import { TankCards } from "../../../components/TankCards";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";
import { LocaleProvider } from "../../../hooks/useLocale";
import { useTierCompare } from "../../../hooks/useTierCompare";

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
  const tanksOrdered = useMemo(() => {
    let list = Object.values(tanks.tanks);

    list = list.sort((a, b) =>
      compareTiers(a.tank!.tier_catalog_id, b.tank!.tier_catalog_id),
    );

    return list;
  }, []);

  return (
    <TankCards>
      {tanksOrdered.slice(0, 32).map(({ id }) => (
        <TankCard key={id} id={id} />
      ))}
    </TankCards>
  );
}
