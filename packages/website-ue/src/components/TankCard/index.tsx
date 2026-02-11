import type { PopularTank } from "../../protos/popular_tanks";
import { Text } from "../Text";
import styles from "./index.module.css";

export function TankCard({ id }: PopularTank) {
  const tanks = useAwait(api.tanks, "tanks");

  return (
    <div className={styles["tank-card"]}>
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
        />
      </div>

      <Text className={styles.name}>{id}</Text>
    </div>
  );
}
