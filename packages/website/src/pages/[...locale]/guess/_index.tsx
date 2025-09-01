import { Box, Flex, Heading } from '@radix-ui/themes';
import { Suspense } from 'react';
import { GuessBackground } from '../../../components/GuessBackground';
import { Guesser } from '../../../components/Guesser';
import { GuessRenderer } from '../../../components/GuessRenderer';
import { GuessRendererLoader } from '../../../components/GuessRendererLoader';
import { awaitableModelDefinitions } from '../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../core/awaitables/tankDefinitions';
import {
  type LocaleAcceptorProps,
  LocaleProvider,
  useLocale,
} from '../../../hooks/useLocale';
import { Duel } from '../../../stores/duel';
import { GuessEphemeral } from '../../../stores/guessEphemeral';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';

const [tankDefinitions, modelDefinitions, provisionDefinitions] =
  await Promise.all([
    awaitableTankDefinitions,
    awaitableModelDefinitions,
    awaitableProvisionDefinitions,
  ]);

const ids = Object.keys(tankDefinitions.tanks);

export function Page({ locale }: LocaleAcceptorProps) {
  const initialId = Number(ids[Math.floor(Math.random() * ids.length)]);
  const initialTank = tankDefinitions.tanks[initialId];

  return (
    <GuessEphemeral.Provider data={initialTank}>
      <LocaleProvider locale={locale}>
        <Container />
      </LocaleProvider>
    </GuessEphemeral.Provider>
  );
}

function Container() {
  const tank = GuessEphemeral.use((state) => state.tank);
  const model = modelDefinitions.models[tank.id];

  return (
    <>
      <TankopediaEphemeral.Provider args={model} />
      <Duel.Provider data={{ tank, model, provisionDefinitions }}>
        <Content />
      </Duel.Provider>
    </>
  );
}

function Content() {
  const { unwrap } = useLocale();
  const tank = GuessEphemeral.use((state) => state.tank);
  const guessState = GuessEphemeral.use((state) => state.guessState);
  const isRevealed = guessState !== null;
  const name = unwrap(tank.name);
  const fontSize = `min(48vh, ${55 / name.length}vw)`;
  const transitionDuration = isRevealed ? '2s' : undefined;

  return (
    <Flex flexGrow="1" position="relative" overflow="hidden">
      <GuessBackground />

      <Heading
        style={{
          transitionDuration,
          opacity: isRevealed ? 1 : 0,
          fontWeight: 900,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
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
          <GuessRenderer />
        </Suspense>
      </Box>

      <Heading
        style={{
          transitionDuration,
          opacity: isRevealed ? 0.5 : 0,
          fontWeight: 900,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {name}
      </Heading>

      <Guesser />
    </Flex>
  );
}
