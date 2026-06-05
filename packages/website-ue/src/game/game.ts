import { assertSecret } from "@blitzkit/core";
import type { GameInterface } from "@blitzkit/game";
import { clientUnmounted } from "./unmounted";

let _game: GameInterface | null = null;

if (!clientUnmounted && import.meta.env.SSR) {
  const { GameInterface } = await import("@blitzkit/game");

  _game = new GameInterface(
    assertSecret(import.meta.env.PUBLIC_WOTB_CLIENT),
    assertSecret(import.meta.env.WOTB_USMAP),
    "../../temp",
  );
}

export const game = _game;
