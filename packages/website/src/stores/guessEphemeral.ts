import type { TankDefinition } from "@blitzkit/core";
import { Varuna } from "varuna";

export interface Guess {
  tank: TankDefinition;
  /**
   * true = correct, false = incorrect, null = not guessed
   */
  guessState: boolean | null;
  totalGuesses: number;
  correctGuesses: number;
}

export const Guess = new Varuna<Guess, TankDefinition>((tank) => ({
  tank,
  guessState: null,
  totalGuesses: 0,
  correctGuesses: 0,
}));
