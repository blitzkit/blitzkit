import { Tankopedia, TankopediaTab } from "../../stores/tankopedia";
import { SegmentedControl } from "../SegmentedControl";
import styles from "./index.module.css";

export function TankopediaTabs() {
  const tab = Tankopedia.use((state) => state.tab);

  return (
    <SegmentedControl
      className={styles.tabs}
      value={tab}
      options={[
        { label: "Sandbox", value: TankopediaTab.Sandbox },
        { label: "Loadout", value: TankopediaTab.Loadout },
      ]}
      onValueChange={(value) => {
        Tankopedia.mutate((state) => {
          state.tab = value as TankopediaTab;
        });
      }}
      variant="overline"
    />
  );
}
