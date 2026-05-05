import { GameInterface } from "@blitzkit/game";

export const clientUnmounted = !("WOTB_CLIENT" in import.meta.env);

let _game: GameInterface | null = null;

if (!clientUnmounted) {
  _game = new GameInterface(import.meta.env.WOTB_CLIENT);
} else {
  console.warn("Running in client denied mode...");
}

export const game = _game;
