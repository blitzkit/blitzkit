import { Box, Flex } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { awaitableTankDefinitions } from '../../../core/awaitables/tankDefinitions';
import { Var } from '../../../core/radix/var';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';
import type { ThicknessRange } from '../../Armor/components/StaticArmor';
import { Options } from './components/Options';
import { TankSandbox } from './components/TankSandbox';
import { NATION_COLORS, Title } from './components/TankSandbox/Title';

const tankDefinitions = await awaitableTankDefinitions;

export function HeroSection({ skeleton }: MaybeSkeletonComponentProps) {
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const canvas = useRef<HTMLCanvasElement>(null);
  const isFullScreen = useFullScreen();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const thicknessRange = useMemo(() => {
    const entries = Object.values(tankDefinitions.tanks);
    const filtered = entries.filter(
      (thisTank) => thisTank.tier === protagonist.tier,
    );
    const value =
      (filtered.reduce((accumulator, thisTank) => {
        return (
          accumulator +
          thisTank.turrets.at(-1)!.guns.at(-1)!.shells[0].penetration.near
        );
      }, 0) /
        filtered.length) *
      (3 / 4);

    return { value } satisfies ThicknessRange;
  }, [protagonist]);
  const duelStore = Duel.useStore();
  const mutateDuel = Duel.useMutation();
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const nationColors = NATION_COLORS[protagonist.nation];

  useEffect(() => {
    if (disturbed) {
      document.body.classList.remove('no-navbar');
    }
  }, [disturbed]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { shells } = duelStore.getState().antagonist.gun;

      times(3, (index) => {
        if (event.key === `${index + 1}` && shells.length > index) {
          mutateDuel((draft) => {
            draft.antagonist.shell = shells[index];
          });
          mutateTankopediaEphemeral((draft) => {
            draft.customShell = undefined;
          });
        }
      });
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Flex
      overflow="hidden"
      justify="center"
      style={{
        backgroundColor: 'black',
      }}
      position="relative"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        top="0"
        left="0"
        style={{
          opacity: disturbed ? 0 : 1,
          background: `linear-gradient(${nationColors.background
            .map((color) => Var(`${color}-2`))
            .join(',')})`,
          transitionDuration: '1s',
        }}
      />

      {/* <ScrollHint /> */}

      <Flex
        direction={{ initial: 'column-reverse', md: 'row' }}
        style={{
          zIndex: isFullScreen ? 2 : undefined,
          transitionDuration: '1s',
          background: isFullScreen ? 'black' : undefined,
        }}
        height={!isFullScreen ? 'calc(100svh - 6rem)' : '100vh'}
        maxHeight={isFullScreen ? undefined : '60rem'}
        maxWidth={isFullScreen ? undefined : '120rem'}
        flexGrow="1"
        width={isFullScreen ? '100vw' : undefined}
        position={isFullScreen ? 'fixed' : 'relative'}
        top={isFullScreen ? '0' : undefined}
        left={isFullScreen ? '0' : undefined}
      >
        <Box
          className="tank-sandbox-container"
          flexGrow="1"
          flexBasis="0"
          flexShrink="0"
          position="relative"
        >
          <Box position="absolute" width="100%" height="100%" overflow="hidden">
            <Title />

            <Box
              width="100%"
              height="100%"
              position="relative"
              style={{
                transitionDuration: '1s',
              }}
            >
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  transitionDuration: '2s',
                  opacity: revealed ? 1 : 0,
                  filter: disturbed
                    ? undefined
                    : `drop-shadow(0 1rem 1rem black)`,
                }}
              >
                <Suspense>
                  <TankSandbox ref={canvas} thicknessRange={thicknessRange} />
                </Suspense>
              </Box>
            </Box>

            <Title foreground />

            <Options
              skeleton={skeleton}
              canvas={canvas}
              thicknessRange={thicknessRange}
            />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
