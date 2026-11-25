import { useMemo } from "react";
import { api } from "../../../../../api/dynamic";
import { ScrollerOrientation } from "../../../../../components/Scroller";
import { ScrollerCurtains } from "../../../../../components/ScrollerCurtains";
import type { ThicknessRange } from "../../../../../components/TankStaticArmor";
import { TankopediaCharacteristics } from "../../../../../components/TankopediaCharacteristics";
import { TankopediaGameModeAbilities } from "../../../../../components/TankopediaGameModeAbilities";
import { TankopediaLoadout } from "../../../../../components/TankopediaLoadout";
import { TankopediaSandbox } from "../../../../../components/TankopediaSandbox";
import { TankopediaTabs } from "../../../../../components/TankopediaTabs";
import { TankopediaTitle } from "../../../../../components/TankopediaTitle";
import { TankopediaVideos } from "../../../../../components/TankopediaVideos";
import { defaultEqualizer } from "../../../../../config/equalizer";
import { withErrorWrapper } from "../../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../../hocs/withLocale";
import { useCharacteristics } from "../../../../../hooks/useCharacteristics";
import { Tankopedia, TankopediaTab } from "../../../../../stores/tankopedia";
import styles from "./_index.module.css";

interface TankProps {
  id: number;
}

const tanks = await api.tanks();

export const Sandbox = withErrorWrapper(
  withLocale<TankProps>(({ id }) => {
    const protagonistTank = tanks.tanks[id];

    Tankopedia.useInitialization(() => protagonistTank);

    const protagonist = Tankopedia.use((state) => state.protagonist);
    const equalize = Tankopedia.use((state) => state.environment.equalize);

    const characteristics = useCharacteristics("protagonist");
    const antagonistCharacteristics = useCharacteristics("antagonist");

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
      <div className={styles.sandbox}>
        <TankopediaTitle />
        <TankopediaSandbox
          antagonistCharacteristics={antagonistCharacteristics}
          thicknessRange={thicknessRange}
        />
        <TankopediaCharacteristics characteristics={characteristics} />
        <TankopediaGameModeAbilities />
        <TankopediaVideos />
        <TankopediaTabs />
      </div>
    );
  }),
);

export const Loadout = withErrorWrapper(
  withLocale<TankProps>(({ id }) => {
    Tankopedia.useInitialization(() => tanks.tanks[id]);

    const tabbed = Tankopedia.use(
      (state) => state.tab === TankopediaTab.Loadout,
    );

    return (
      <div className={styles.loadout} data-tabbed={tabbed}>
        <ScrollerCurtains orientation={ScrollerOrientation.Vertical} />
        <TankopediaLoadout />
      </div>
    );
  }),
);
