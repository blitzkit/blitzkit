import type { TankDefinition } from "@blitzkit/core";
import { Varuna } from "varuna";
import { awaitableTiers } from "../core/awaitables/tiers";

const tiers = await awaitableTiers;

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

export const Guess = new Soapstone<Guess, [TankDefinition]>((tank) => ({
  tank,
  guessState: GuessState.NotGuessed,
  totalGuesses: 0,
  correctGuesses: 0,
  streak: 0,
  helpingReveal: false,
  tiers,
}));
