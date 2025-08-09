import { TankType } from '@blitzkit/core';
import { Flex, Heading } from '@radix-ui/themes';
import { Var } from '../../../../../../core/radix/var';
import { useLocale } from '../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../stores/duel';
import type { RadixColor } from '../../../../../../stores/embedState';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { Tracker } from './components/Tracker';

interface TitleProps {
  foreground?: boolean;
}

export const NATION_COLORS: Record<
  string,
  {
    text: RadixColor;
    background: RadixColor[];
    tint: RadixColor;
  }
> = {
  france: {
    text: 'mint',
    tint: 'purple',
    background: ['mint', 'cyan', 'jade'],
  },
  germany: {
    text: 'sage',
    tint: 'blue',
    background: ['slate', 'sage', 'mauve'],
  },
  usa: {
    text: 'gold',
    tint: 'red',
    background: ['brown', 'gold', 'gray'],
  },
  european: {
    text: 'sky',
    tint: 'violet',
    background: ['cyan', 'blue', 'indigo'],
  },
  ussr: {
    text: 'bronze',
    tint: 'red',
    background: ['bronze', 'tomato', 'bronze'],
  },
  uk: {
    text: 'gold',
    tint: 'red',
    background: ['bronze', 'gold', 'brown'],
  },
  japan: {
    text: 'mint',
    tint: 'violet',
    background: ['green', 'teal', 'jade'],
  },
  china: {
    text: 'mint',
    tint: 'pink',
    background: ['green', 'teal', 'jade'],
  },
  other: {
    text: 'amber',
    tint: 'sky',
    background: ['amber', 'yellow', 'gray'],
  },
};

export function Title({ foreground }: TitleProps) {
  const { unwrap } = useLocale();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const nationColors = NATION_COLORS[protagonist.nation];
  const color = Var(
    disturbed
      ? protagonist.type === TankType.COLLECTOR
        ? 'blue-11'
        : protagonist.type === TankType.PREMIUM
          ? 'amber-11'
          : 'gray-12'
      : `${nationColors.text}-12`,
  );
  const name = unwrap(protagonist.name);
  const fontSize = revealed
    ? disturbed
      ? '2rem'
      : `min(65vh, ${125 / name.length}vw)`
    : `min(48vh, ${75 / name.length}vw)`;
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();

  return (
    <Flex
      onPointerDown={(event) => {
        event.preventDefault();

        mutateTankopediaEphemeral((draft) => {
          draft.disturbed = true;
        });
      }}
      direction="column"
      position="absolute"
      align="center"
      justify="center"
      top={disturbed ? '6rem' : '50%'}
      left="50%"
      width="100%"
      height={disturbed ? fontSize : '100%'}
      style={{
        pointerEvents: disturbed ? 'none' : undefined,
        transitionDuration: '1s',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Heading
        style={{
          fontWeight: 900,
          userSelect: 'none',
          pointerEvents: 'none',
          fontSize,
          whiteSpace: 'nowrap',
          color: foreground ? Var('gray-a10') : color,
          opacity: foreground && disturbed ? 0 : 1,
          letterSpacing: disturbed || !revealed ? 0 : '-0.03em',
          transition: `
            letter-spacing 1.5s ${disturbed ? '' : 'cubic-bezier(0.81, -2, 0.68, 1)'},
            font-size 1s,
            -webkit-text-stroke 2s,
            opacity 1s
          `,
        }}
        wrap="nowrap"
      >
        {name}
      </Heading>

      {!revealed && <Tracker fontSize={fontSize} />}
    </Flex>
  );
}
