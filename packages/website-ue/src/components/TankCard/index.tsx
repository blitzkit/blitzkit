import { api } from "../../core/api/dynamic";
import { useAwait } from "../../hooks/useAwait";
import { useGameStrings } from "../../hooks/useGameStrings";
import { useLocale } from "../../hooks/useLocale";
import type { PropsWithSkeleton } from "../../types/propsWithSkeleton";
import { InlineSkeleton } from "../InlineSkeleton";
import { LinkI18n } from "../LinkI18n";
import { Skeleton } from "../Skeleton";
import { Text } from "../Text";
import styles from "./index.module.css";

interface TankCardProps {
  id: string;
  subtitle?: string;
}

export function TankCard(props: PropsWithSkeleton<TankCardProps>) {
  const tank = props.skeleton
    ? undefined
    : useAwait(() => api.tank(props.id), `tank-${props.id}`);
  const gameStrings = props.skeleton ? undefined : useGameStrings("TankEntity");
  const locale = useLocale();

  return (
    <LinkI18n
      href={props.skeleton ? undefined : `/tanks/${tank!.slug}`}
      underline="never"
      locale={locale}
      className={styles["tank-card"]}
    >
      <div className={styles["icon-wrapper"]}>
        {!props.skeleton && (
          <div
            className={styles.flag}
            style={{
              backgroundImage: `url(/api/nations/${tank!.tank!.nation}/card.webp)`,
            }}
          />
        )}

        {!props.skeleton && (
          <div
            className={styles.icon}
            style={{
              backgroundImage: `url(/api/tanks/${props.id}.webp)`,
            }}
          />
        )}

        {props.skeleton && <Skeleton className={styles.icon} />}
      </div>

      <div className={styles.name}>
        <Text className={styles.text} data-skeleton={props.skeleton}>
          {props.skeleton && <InlineSkeleton className={styles.skeleton} />}
          {!props.skeleton && gameStrings![tank!.tank!.name!.value]}
        </Text>
      </div>
    </LinkI18n>
  );
}
