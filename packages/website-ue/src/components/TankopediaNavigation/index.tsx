import { useStrings } from "../../hooks/useStrings";
import { Tankopedia, TankopediaTab } from "../../stores/tankopedia";
import { Text } from "../Text";
import styles from "./index.module.css";

export function TankopediaNavigation() {
  const strings = useStrings();
  const tab = Tankopedia.use((state) => state.tab);

  return (
    <div className={styles.tabs}>
      <div
        className={styles.tab}
        data-selected={tab === TankopediaTab.Tank}
        onClick={() => {
          Tankopedia.mutate((draft) => {
            draft.tab = TankopediaTab.Tank;
          });
        }}
      >
        <Text>{strings.tanks.navigation.tank}</Text>
      </div>

      <div
        className={styles.tab}
        data-selected={tab === TankopediaTab.Characteristics}
        onClick={() => {
          Tankopedia.mutate((draft) => {
            draft.tab = TankopediaTab.Characteristics;
          });
        }}
      >
        <Text>{strings.tanks.navigation.characteristics}</Text>
      </div>
    </div>
  );
}
