import { Box, Flex, Heading } from "@radix-ui/themes";
import { Suspense, useEffect } from "react";
import { api } from "../../../../api/dynamic";
import { GuessBackground } from "../../../../components/GuessBackground";
import { Guesser } from "../../../../components/Guesser";
import { GuessRenderer } from "../../../../components/GuessRenderer";
import { GuessRendererLoader } from "../../../../components/GuessRendererLoader";
import { withErrorWrapper } from "../../../../hocs/withErrorWrapper";
import { withLocale } from "../../../../hocs/withLocale";
import { DuelModule, useDuel } from "../../../../hooks/useDuel";
import { useUnwrapper } from "../../../../hooks/useUnwrapper";
import { Guess, GuessState } from "../../../../stores/guess";
import { Tankopedia } from "../../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";

const [tankDefinitions, modelDefinitions] = await Promise.all([
  api.tanks(),
  api.models(),
]);

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

  return <Content skeleton={skeleton} />;
}

function Content({ skeleton }: MaybeSkeletonComponentProps) {
  const tank = useDuel("protagonist", DuelModule.Tank);

  const unwrap = useUnwrapper();

  const name = unwrap(tank.name!);

  const guessState = Guess.use((state) => state.guessState);
  const isRevealed = guessState !== GuessState.NotGuessed;
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
      filteredIds[Math.floor(Math.random() * filteredIds.length)],
    );

    Guess.mutate((draft) => {
      draft.tank = id;
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
