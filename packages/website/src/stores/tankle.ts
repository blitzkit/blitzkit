import type { TankDefinition } from "@blitzkit/core";
import { Varuna } from "varuna";
import { GuessState } from "./guess";

export interface Tankle {
  tank: TankDefinition;
  guesses: TankDefinition[];
  guessState: GuessState;
  totalGuesses: number;
  correctGuesses: number;
  streak: number;
}

export const Tankle = new Varuna<Tankle, TankDefinition>((tank) => ({
  tank,
  guesses: [],
  guessState: GuessState.NotGuessed,
  totalGuesses: 0,
  correctGuesses: 0,
  streak: 0,
}));
