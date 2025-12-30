import { Guess, GuessState } from "../stores/guess";
import { SmartCanvas } from "./SmartCanvas";
import { Controls } from "./Tankopedia/HeroSection/components/TankSandbox/components/Control";
import { Lighting } from "./Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { TankModel } from "./Tankopedia/HeroSection/components/TankSandbox/components/TankModel";

const BRIGHTNESS = 2 ** -5.5;
const CONTRAST = 2 ** 2;

export function GuessRenderer() {
  const guessState = Guess.use((state) => state.guessState);
  const helpingReveal = Guess.use((state) => state.helpingReveal);
  const isRevealed = helpingReveal || guessState !== GuessState.NotGuessed;

  return (
    <SmartCanvas
      style={{
        filter: `grayscale(${isRevealed ? 0 : 1}) contrast(${
          isRevealed ? 1 : CONTRAST
        }) brightness(${isRevealed ? 1 : BRIGHTNESS})`,
        transitionDuration: isRevealed ? "2s" : undefined,
        transitionProperty: "filter",
      }}
      camera={{ position: [-5, 5, -5] }}
    >
      <Controls zoomable={false} />
      <Lighting />
      <TankModel />
    </SmartCanvas>
  );
}
