import { Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { awaitableModelDefinitions } from "../../core/awaitables/modelDefinitions";
import { awaitableProvisionDefinitions } from "../../core/awaitables/provisionDefinitions";
import { tankToDuelMember } from "../../core/blitzkit/tankToDuelMember";
import { Var } from "../../core/radix/var";
import { Duel } from "../../stores/duel";
import { Guess, GuessState } from "../../stores/guess";
import { Tankopedia } from "../../stores/tankopedia";
import "./index.css";

const [modelDefinitions, provisionDefinitions] = await Promise.all([
  awaitableModelDefinitions,
  awaitableProvisionDefinitions,
]);

export function GuessBackground() {
  const guessState = Guess.use((state) => state.guessState);
  const tank = Guess.use((state) => state.tank);
  const mutateDuel = Duel.useMutation();

  useEffect(() => {
    mutateDuel((state) => {
      state.protagonist = tankToDuelMember(tank, provisionDefinitions);
    });
    Tankopedia.mutate((state) => {
      state.model = modelDefinitions.models[tank.id];
    });
  }, [tank]);

  return (
    <>
      <Box
        position="absolute"
        width="100%"
        height="100%"
        top="0"
        left="0"
        style={{
          transitionDuration: "2s",
          backgroundColor: Var(
            guessState === GuessState.NotGuessed
              ? "accent-2"
              : guessState === GuessState.Correct
                ? "jade-3"
                : "tomato-3"
          ),
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            background: `radial-gradient(circle, ${Var("color-panel-translucent")}, ${Var("color-panel-solid")})`,
          }}
        />
      </Box>

      <Box
        className="guess-background"
        position="absolute"
        width="200%"
        height="200%"
        top="0"
        left="0"
        style={{
          backgroundImage: `
            radial-gradient(circle, ${Var("white-a1")} 20%, transparent 20%),
            radial-gradient(circle at 0 0, ${Var("white-a1")} 10%, transparent 10%),
            radial-gradient(circle at 100% 0, ${Var("white-a1")} 10%, transparent 10%),
            radial-gradient(circle at 0 100%, ${Var("white-a1")} 10%, transparent 10%),
            radial-gradient(circle at 100% 100%, ${Var("white-a1")} 10%, transparent 10%)
          `,
          backgroundSize: "4rem 4rem",
        }}
      />
    </>
  );
}
