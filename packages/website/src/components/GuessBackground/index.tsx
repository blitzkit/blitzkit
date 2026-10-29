import { useEffect } from "react";
import { api } from "../../api/dynamic";
import { Guess } from "../../stores/guess";
import { Tankopedia } from "../../stores/tankopedia";
import { createTankState } from "../../tankopedia/createTankState";
import styles from "./index.module.css";

const [models, tanks] = await Promise.all([api.models(), api.tanks()]);

export function GuessBackground() {
  const guessState = Guess.use((state) => state.guessState);
  const id = Guess.use((state) => state.tank);

  useEffect(() => {
    const tank = tanks.tanks[id];

    Tankopedia.mutate((state) => {
      state.protagonist = createTankState(tank);
    });
  }, [id]);

  return (
    <>
      <div className={styles.foreground} data-guess-state={guessState}>
        <div className={styles.overlay} />
      </div>

      <div className={styles.background} />
    </>
  );
}
