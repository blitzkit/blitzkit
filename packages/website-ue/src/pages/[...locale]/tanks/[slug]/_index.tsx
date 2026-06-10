import { useMemo } from "react";
import { api } from "../../../../api/dynamic";
import { TankopediaCharacteristics } from "../../../../components/TankopediaCharacteristics";
import { TankopediaLoadout } from "../../../../components/TankopediaLoadout";
import { TankopediaSandbox } from "../../../../components/TankopediaSandbox";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import { useAwait } from "../../../../hooks/useAwait";
import { useEquipment } from "../../../../hooks/useEquipment";
import { Tankopedia } from "../../../../stores/tankopedia";
import { computeCharacteristics } from "../../../../tankopedia/computeCharacteristics";
import styles from "./_index.module.css";

interface PageProps {
  id: string;
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
