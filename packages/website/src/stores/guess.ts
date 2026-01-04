import type { TankDefinition } from "@blitzkit/core";
import { times } from "lodash-es";
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
  helpingReveal: boolean;
  tiers: number[];
}

export const Guess = new Varuna<Guess, TankDefinition>((tank) => ({
  tank,
  guessState: GuessState.NotGuessed,
  totalGuesses: 0,
  correctGuesses: 0,
  streak: 0,
  helpingReveal: false,
  tiers: times(10, (index) => index + 1),
}));
