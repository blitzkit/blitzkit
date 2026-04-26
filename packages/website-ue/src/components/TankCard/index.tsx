import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import { useGameStrings } from "../../hooks/useGameStrings";
import { useLocale } from "../../hooks/useLocale";
import { LinkI18n } from "../LinkI18n";
import { Text } from "../Text";
import styles from "./index.module.css";

interface TankCardProps {
  id: string;
  subtitle?: string;
}

export function TankCard({ id }: TankCardProps) {
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
            backgroundImage: `url(/api/nations/${tank.tank!.nation}.webp)`,
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
