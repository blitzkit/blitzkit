import { Fragment, useMemo } from "react";
import { api } from "../../../../api/dynamic";
import { TankopediaLoadout } from "../../../../components/TankopediaLoadout";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import { useAwait } from "../../../../hooks/useAwait";
import { useCharacteristicRenderer } from "../../../../hooks/useCharacteristicRenderer";
import { useEquipment } from "../../../../hooks/useEquipment";
import { Tankopedia } from "../../../../stores/tankopedia";
import { characteristicsOrder } from "../../../../tankopedia/characteristicsOrder";
import { computeCharacteristics } from "../../../../tankopedia/computeCharacteristics";
import styles from "./_index.module.css";
import { TankopediaSandbox } from "../../../../components/TankopediaSandbox";

interface PageProps {
  id: string;
}

export const Page = withErrorWrapper(
  withLocale<PageProps>(({ id }) => {
    const protagonistTank = useAwait(() => api.tank(id), `tank-${id}`);

    Tankopedia.useInitialization(protagonistTank);

    // const renderCharacteristic = useCharacteristicRenderer();

    const protagonist = Tankopedia.use((state) => state.protagonist);
    const protagonistEquipment = useEquipment(protagonistTank.tank!);

    const { characteristics } = useMemo(
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
        <div className={styles.sandbox}>
          <TankopediaSandbox />
        </div>

        <div className={styles.stats}>
          <TankopediaLoadout characteristics={characteristics} />
        </div>
      </div>
    );
  }),
);

export const _Page = withErrorWrapper(
  withLocale<PageProps>(({ id }) => {
    const protagonistTank = useAwait(() => api.tank(id), `tank-${id}`);

    Tankopedia.useInitialization(protagonistTank);

    const renderCharacteristic = useCharacteristicRenderer();

    const protagonist = Tankopedia.use((state) => state.protagonist);
    const protagonistEquipment = useEquipment(protagonistTank.tank!);

    const { characteristics } = useMemo(
      () =>
        computeCharacteristics(
          protagonistTank,
          protagonistEquipment,
          protagonist,
        ),
      [protagonist],
    );

    return (
      <>
        <h1>{protagonist.id}</h1>

        <br />

        <TankopediaLoadout characteristics={characteristics} />

        <h2>characteristics</h2>

        {characteristicsOrder.map((group) => {
          return (
            <Fragment key={group.group}>
              <h3>{group.group}</h3>

              {group.order.map((item) => {
                if ("toy" in item) {
                  return <span key={`toy-${item.toy}`}>toy: {item.toy}</span>;
                }

                const value = characteristics[item.name];

                if (value == null) return null;

                return (
                  <span key={`characteristic-${item.name}`}>
                    {item.name}: {renderCharacteristic(value, item)}
                  </span>
                );
              })}
            </Fragment>
          );
        })}
      </>
    );
  }),
);
