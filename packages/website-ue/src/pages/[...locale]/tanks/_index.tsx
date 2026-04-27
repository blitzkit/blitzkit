import { TankCard } from "../../../components/TankCard";
import { TankCards } from "../../../components/TankCards";
import { api } from "../../../core/api/dynamic";
import { useAwait } from "../../../hooks/useAwait";
import { LocaleProvider } from "../../../hooks/useLocale";

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
  const tankList = useAwait(() => api.tankList(), "tank-list");

  return (
    <TankCards>
      {tankList.list.slice(0, 32).map(({ id }) => (
        <TankCard key={id} id={id} />
      ))}
    </TankCards>
  );
}
