import { jadeDark, tomatoDark } from "@radix-ui/colors";
import { useModel } from "../../hooks/useModel";
import { Guess, GuessState } from "../../stores/guess";
import { CanvasControl } from "../CanvasControl";
import { Lighting } from "../Lighting";
import { SceneProps } from "../SceneProps";
import { SmartCanvas } from "../SmartCanvas";
import { TankModel } from "../TankModel";

export function GuessRenderer() {
  const guessState = Guess.use((state) => state.guessState);
  const helpingReveal = Guess.use((state) => state.helpingReveal);
  const advancing = Guess.use((state) => state.advancing);
  const isRevealed =
    (helpingReveal || guessState !== GuessState.NotGuessed) && !advancing;

  const id = Guess.use((state) => state.tank);

  const groundColor =
    guessState === GuessState.Correct
      ? jadeDark.jade6
      : guessState === GuessState.Incorrect
      ? tomatoDark.tomato6
      : undefined;

  const { hasPbr } = useModel(id);

  return (
    <SmartCanvas camera={{ position: [-5, 5, -5] }}>
      <SceneProps color={groundColor} />
      <CanvasControl zoomable={false} />
      <Lighting hasPbr={hasPbr} hidden={!isRevealed} />
      <TankModel silhouette={!advancing} />
    </SmartCanvas>
  );
}
