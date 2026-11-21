import { Suspense, useEffect } from "react";
import { api } from "../../../../api/dynamic";
import { Guesser } from "../../../../components/Guesser";
import { GuessRenderer } from "../../../../components/GuessRenderer";
import { GuessRendererLoader } from "../../../../components/GuessRendererLoader";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import { useDuelModules } from "../../../../hooks/useDuelModules";
import { Guess, GuessState } from "../../../../stores/guess";
import { Tankopedia } from "../../../../stores/tankopedia";
import { createTankState } from "../../../../tankopedia/createTankState";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";
import styles from "./_index.module.css";

const [tankDefinitions] = await Promise.all([api.tanks()]);

const ids = Object.keys(tankDefinitions.tanks);

export const Page = withLocale(
  withErrorWrapper(({ skeleton }: MaybeSkeletonComponentProps) => {
    const id = Number(ids[Math.floor(Math.random() * ids.length)]);

    Guess.useInitialization(id);

    return <Container skeleton={skeleton} />;
  }),
);

function Container({ skeleton }: MaybeSkeletonComponentProps) {
  const id = Guess.use((state) => state.tank);
  const tank = tankDefinitions.tanks[id];

  Tankopedia.useInitialization(tank);

  useEffect(() => {
    Tankopedia.mutate((draft) => {
      draft.protagonist = createTankState(tank);
    });
  }, [id]);

  return <Content skeleton={skeleton} />;
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  const protagonist = useDuelModules("protagonist");
  const tiers = Guess.use((state) => state.tiers);

  useEffect(() => {
    const isTankAlreadyCompliant = tiers.includes(protagonist.tank.tier);

    if (isTankAlreadyCompliant) return;

    const filteredIds = ids.filter((id) => {
      const tank = tankDefinitions.tanks[Number(id)];
      return tiers.includes(tank.tier);
    });

    if (filteredIds.length === 0) return;

    const id = Number(
      filteredIds[Math.floor(Math.random() * filteredIds.length)],
    );

    Guess.mutate((draft) => {
      draft.tank = id;
      draft.guessState = GuessState.NotGuessed;
      draft.helpingReveal = false;
    });
  }, [tiers]);

  return (
    <div className={styles.content}>
      <Suspense fallback={<GuessRendererLoader />}>
        {!skeleton && <GuessRenderer />}
      </Suspense>

      <Guesser />
    </div>
  );
}
