import { GuessEphemeral } from '../stores/guessEphemeral';
import { TankopediaDisplay } from '../stores/tankopediaPersistent/constants';
import { SmartCanvas } from './SmartCanvas';
import { Controls } from './Tankopedia/HeroSection/components/TankSandbox/components/Control';
import { Lighting } from './Tankopedia/HeroSection/components/TankSandbox/components/Lighting';
import { TankModel } from './Tankopedia/HeroSection/components/TankSandbox/components/TankModel';

const BRIGHTNESS = 2 ** -5;
const CONTRAST = 2 ** 2;

export function GuessRenderer() {
  const guessState = GuessEphemeral.use((state) => state.guessState);
  const isRevealed = guessState !== null;

  return (
    <SmartCanvas
      style={{
        filter: `grayscale(${isRevealed ? 0 : 1}) contrast(${isRevealed ? 1 : CONTRAST}) brightness(${isRevealed ? 1 : BRIGHTNESS})`,
        // filter: `drop-shadow(0 0 1rem ${Var('black-a11')})`,
        transitionDuration: isRevealed ? '2s' : undefined,
        transitionProperty: 'filter',
      }}
      camera={{ position: [-5, 5, -5] }}
    >
      <Controls distanceScale={2} zoomable={false} />
      <Lighting display={TankopediaDisplay.Model} />
      <TankModel />
    </SmartCanvas>
  );
}
