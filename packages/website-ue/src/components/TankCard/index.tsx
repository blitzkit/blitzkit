import { Text } from "../Text";
import styles from "./index.module.css";

interface TankCard {
  tank: string;
}

export function TankCard({ tank }: TankCard) {
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
            backgroundImage: "url(https://i.imgur.com/HrkTwHc.png)",
          }}
        />
      </div>

      <Text className={styles.name}>{tank}</Text>
    </div>
  );
}
