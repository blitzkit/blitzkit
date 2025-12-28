import type { TankDefinition } from "@blitzkit/core";
import { Varuna } from "varuna";

export enum GuessState {
  Correct,
  Incorrect,
  NotGuessed,
}

export interface Guess {
  tank: TankDefinition;
  guessState: GuessState;
  totalGuesses: number;
  correctGuesses: number;
  streak: number;
}

export const Guess = new Varuna<Guess, TankDefinition>((tank) => ({
  tank,
  guessState: GuessState.NotGuessed,
  totalGuesses: 0,
  correctGuesses: 0,
  streak: 0,
}));
