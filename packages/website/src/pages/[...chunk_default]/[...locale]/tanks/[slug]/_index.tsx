import { useMemo } from "react";
import { api } from "../../../../../core/blitzkit/api";
import { withErrorWrapper } from "../../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../../hocs/withLocale";
import { useAwait } from "../../../../../hooks/useAwait";
import { Tankopedia } from "../../../../../stores/tankopedia";
import styles from "./_index.module.css";

interface PageProps {
  id: number;
}

export const Page = withErrorWrapper(
  withLocale<PageProps>(({ id }) => {
    const protagonistTank = useAwait(() => api.tank(id), `tank-${id}`);

    Tankopedia.useInitialization(protagonistTank);

    const protagonist = Tankopedia.use((state) => state.protagonist);
    const protagonistEquipment = useEquipment(protagonistTank.tank!);

    const { characteristics, parameters } = useMemo(
      () =>
        computeCharacteristics(
          protagonistTank,
          protagonistEquipment,
          protagonist,
        ),
      [protagonist],
    );

    return (
      <div className={styles.page}>
        <div className={styles.loadout}>
          <TankopediaLoadout characteristics={characteristics} />
        </div>

        <div className={styles.sandbox}>
          <TankopediaSandbox parameters={parameters} />
          <TankopediaCharacteristics characteristics={characteristics} />
        </div>
      </div>
    );
  }),
);
