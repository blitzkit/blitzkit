import { Flex, Heading } from '@radix-ui/themes';
import { useLocale } from '../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';
import { Tracker } from './components/Tracker';

export function Title() {
  const { unwrap } = useLocale();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const name = unwrap(protagonist.name);
  const fontSize = revealed
    ? disturbed
      ? '2rem'
      : `min(16vh, ${125 / name.length}vw)`
    : `min(12vh, ${75 / name.length}vw)`;
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
          opacity: disturbed ? 1 : 0.5,
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
