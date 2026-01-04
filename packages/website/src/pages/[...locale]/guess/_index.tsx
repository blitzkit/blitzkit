import { Box, Flex, Heading } from "@radix-ui/themes";
import { Suspense, useEffect } from "react";
import { GuessBackground } from "../../../components/GuessBackground";
import { Guesser } from "../../../components/Guesser";
import { GuessRenderer } from "../../../components/GuessRenderer";
import { GuessRendererLoader } from "../../../components/GuessRendererLoader";
import { PageWrapper } from "../../../components/PageWrapper";
import { awaitableModelDefinitions } from "../../../core/awaitables/modelDefinitions";
import { awaitableTankDefinitions } from "../../../core/awaitables/tankDefinitions";
import {
  type LocaleAcceptorProps,
  LocaleProvider,
  useLocale,
} from "../../../hooks/useLocale";
import { Duel } from "../../../stores/duel";
import { Guess, GuessState } from "../../../stores/guess";
import { Tankopedia } from "../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";

const [tankDefinitions, modelDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableModelDefinitions,
]);

const ids = Object.keys(tankDefinitions.tanks);

export function Page({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  const id = Number(ids[Math.floor(Math.random() * ids.length)]);
  const tank = tankDefinitions.tanks[id];

  Guess.useInitialization(tank);

  return (
    <LocaleProvider locale={locale}>
      <Container skeleton={skeleton} />
    </LocaleProvider>
  );
}

function Container({ skeleton }: MaybeSkeletonComponentProps) {
  const tank = Guess.use((state) => state.tank);
  const model = modelDefinitions.models[tank.id];

  Tankopedia.useInitialization(model);
  Duel.useInitialization({ tank, model });

  return (
    <PageWrapper p="0" maxWidth="unset" color="cyan">
      <Content skeleton={skeleton} />
    </PageWrapper>
  );
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  const { unwrap } = useLocale();
  const tank = Guess.use((state) => state.tank);
  const guessState = Guess.use((state) => state.guessState);
  const isRevealed = guessState !== GuessState.NotGuessed;
  const name = unwrap(tank.name);
  const fontSize = `min(48vh, ${55 / name.length}vw)`;
  const transitionDuration = isRevealed ? "2s" : undefined;
  const tiers = Guess.use((state) => state.tiers);

  useEffect(() => {
    const isTankAlreadyCompliant = tiers.includes(tank.tier);

    if (isTankAlreadyCompliant) return;

    const filteredIds = ids.filter((id) => {
      const tank = tankDefinitions.tanks[Number(id)];
      return tiers.includes(tank.tier);
    });

    if (filteredIds.length === 0) return;

    const id = Number(
      filteredIds[Math.floor(Math.random() * filteredIds.length)]
    );
    const newTank = tankDefinitions.tanks[id];

    Guess.mutate((draft) => {
      draft.tank = newTank;
      draft.guessState = GuessState.NotGuessed;
      draft.helpingReveal = false;
    });
  }, [tiers]);

  return (
    <Flex flexGrow="1" position="relative" overflow="hidden">
      <GuessBackground />

      <Heading
        style={{
          transitionDuration,
          opacity: isRevealed ? 1 : 0,
          fontWeight: 900,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontSize,
          userSelect: "none",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {name}
      </Heading>

      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        style={{ transitionDuration }}
      >
        <Suspense fallback={<GuessRendererLoader />}>
          {!skeleton && <GuessRenderer />}
        </Suspense>
      </Box>

      <Heading
        style={{
          transitionDuration,
          opacity: isRevealed ? 0.5 : 0,
          fontWeight: 900,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontSize,
          userSelect: "none",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {name}
      </Heading>

      <Guesser />
    </Flex>
  );
}
