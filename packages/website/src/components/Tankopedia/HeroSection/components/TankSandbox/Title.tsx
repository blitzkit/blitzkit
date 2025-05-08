import { TankType } from '@blitzkit/core';
import { Box, Heading } from '@radix-ui/themes';
import { Var } from '../../../../../core/radix/var';
import { useLocale } from '../../../../../hooks/useLocale';
import { Duel } from '../../../../../stores/duel';
import type { RadixColor } from '../../../../../stores/embedState';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';

interface TitleProps {
  outline?: boolean;
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

export function Title({ outline }: TitleProps) {
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

  return (
    <Box
      position="absolute"
      top={disturbed ? '6rem' : '50%'}
      left="50%"
      style={{
        transitionDuration: '1s',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Heading
        style={{
          fontWeight: 900,
          userSelect: 'none',
          pointerEvents: 'none',
          fontSize: revealed
            ? disturbed
              ? '2rem'
              : `${125 / name.length}vw`
            : `${75 / name.length}vw`,
          whiteSpace: 'nowrap',
          color: outline ? Var(`${nationColors.tint}-a2`) : color,
          opacity: outline && disturbed ? 0 : 1,
          WebkitTextStroke: outline
            ? `${revealed ? (disturbed ? '1px' : 'min(2px, 0.2vw)') : 0} ${color}`
            : undefined,
          letterSpacing: disturbed || !revealed ? 0 : '-0.03em',
          transition: `
            letter-spacing 1.5s cubic-bezier(.81,-2,.68,1),
            font-size 1s,
            -webkit-text-stroke 2s,
            opacity 1s
          `,
        }}
        wrap="nowrap"
      >
        {name}
      </Heading>
    </Box>
  );
}
