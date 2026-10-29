import { Soapstone } from "soapstone";
import { awaitableTiers } from "../core/awaitables/tiers";

const tiers = await awaitableTiers;

export enum GuessState {
  Correct = "correct",
  Incorrect = "incorrect",
  NotGuessed = "not-guessed",
}

export interface Guess {
  tank: number;
  guessState: GuessState;
  totalGuesses: number;
  correctGuesses: number;
  streak: number;
  helpingReveal: boolean;
  tiers: number[];
}

export const Guess = new Soapstone<Guess, [number]>((tank) => ({
  tank,
  guessState: GuessState.NotGuessed,
  totalGuesses: 0,
  correctGuesses: 0,
  streak: 0,
  helpingReveal: false,
  tiers,
}));
