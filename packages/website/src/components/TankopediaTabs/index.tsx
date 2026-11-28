import { api } from "../../api/dynamic";
import { withErrorWrapper } from "../../hocs/withErrorWrapper";
import { withLocale } from "../../hocs/withLocale";
import { Tankopedia, TankopediaTab } from "../../stores/tankopedia";
import { SegmentedControl } from "../SegmentedControl";
import styles from "./index.module.css";

const tanks = await api.tanks();

interface TankopediaTabsProps {
  id: number;
}

export const TankopediaTabs = withErrorWrapper(
  withLocale<TankopediaTabsProps>(Content)
);

function Content({ id }: TankopediaTabsProps) {
  Tankopedia.useInitialization(() => tanks.tanks[id], import.meta.env.SSR);

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
