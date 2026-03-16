import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import { useGameStrings } from "../../hooks/useGameStrings";
import { useLocale } from "../../hooks/useLocale";
import type { PopularTank } from "../../protos/popular_tanks";
import { LinkI18n } from "../LinkI18n";
import { Text } from "../Text";
import styles from "./index.module.css";

export function TankCard({ id }: PopularTank) {
  const tank = useAwait(() => api.tank(id), `tank-${id}`);
  const gameStrings = useGameStrings("TankEntity");
  const locale = useLocale();

  return (
    <LinkI18n
      href={`/tanks/${tank.slug}`}
      underline="never"
      locale={locale}
      className={styles["tank-card"]}
    >
      <div className={styles["icon-wrapper"]}>
        <div
          className={styles.flag}
          style={{
            backgroundImage: "url(https://i.imgur.com/QGUfXNo.png)",
          }}
        />

        <div
          className={styles.icon}
          style={{
            backgroundImage: `url(/api/tanks/${id}.webp)`,
          }}
        >
          <div className={styles.cover} />
        </div>
      </div>

      <Text className={styles.name}>{gameStrings[tank.tank!.name!.value]}</Text>
    </LinkI18n>
  );
}
