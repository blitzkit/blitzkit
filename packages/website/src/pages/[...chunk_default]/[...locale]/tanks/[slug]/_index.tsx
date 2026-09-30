import { useMemo } from "react";
import { api } from "../../../../../api/dynamic";
import type { ThicknessRange } from "../../../../../components/StaticArmor";
import { TankopediaCharacteristics } from "../../../../../components/TankopediaCharacteristics";
import { TankopediaLoadout } from "../../../../../components/TankopediaLoadout";
import { TankopediaSandbox } from "../../../../../components/TankopediaSandbox";
import { defaultEqualizer } from "../../../../../config/equalizer";
import { withErrorWrapper } from "../../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../../hocs/withLocale";
import { useAwait } from "../../../../../hooks/useAwait";
import { Tankopedia } from "../../../../../stores/tankopedia";
import { computeCharacteristics } from "../../../../../tankopedia/computeCharacteristics";
import type { MaybeSkeletonComponentProps } from "../../../../../types/maybeSkeletonComponentProps";
import styles from "./_index.module.css";

type PageProps = MaybeSkeletonComponentProps & {
  id: number;
};

const tanks = await api.tanks();

export const Page = withErrorWrapper(
  withLocale<PageProps>(({ skeleton, id }) => {
    const protagonistTank = useAwait(() => api.tank(id), `tank-${id}`);

    Tankopedia.useInitialization(protagonistTank);

    const protagonist = Tankopedia.use((state) => state.protagonist);
    // const protagonistEquipment = useEquipment("protagonist", protagonistTank.tank!);

    const characteristics = useMemo(
      () => computeCharacteristics(),
      [protagonist],
    );

    const equalize = Tankopedia.use((state) => state.equalize);
    const thicknessRange = useMemo(() => {
      const entries = Object.values(tanks.tanks);
      const filtered = entries.filter(
        (thisTank) => thisTank.tier === protagonistTank.tier,
      );
      const value =
        (filtered.reduce((accumulator, thisTank) => {
          return (
            accumulator +
            thisTank.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration!.near *
              ((equalize ? thisTank.equalizer : undefined) ?? defaultEqualizer)
                .penetration
          );
        }, 0) /
          filtered.length) *
        (3 / 4);

      return { value } satisfies ThicknessRange;
    }, [protagonist, equalize]);

    return (
      <div className={styles.page}>
        <div className={styles.loadout}>
          <TankopediaLoadout characteristics={characteristics} />
        </div>

        <div className={styles.sandbox}>
          {!skeleton && <TankopediaSandbox thicknessRange={thicknessRange} />}
          <TankopediaCharacteristics
            computedCharacteristics={characteristics}
          />
        </div>
      </div>
    );
  }),
);
