import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from "../../hooks/useLocale";
import { Scroller } from "../Scroller";
import { TankCard } from "../TankCard";
import styles from "./index.module.css";

export function HomeTanksPopular({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const popular = useAwait(() => api.popularTanks(), "popular-tanks");
  const trimmed = popular.tanks.slice(0, 32);

  return (
    <Scroller className={styles.tanks}>
      <div className={styles.content}>
        {trimmed.map((tank) => (
          <TankCard key={tank.id} {...tank} />
        ))}
      </div>
    </Scroller>
  );
}
