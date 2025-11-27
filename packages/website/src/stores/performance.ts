import type { Samples } from "@blitzkit/core";
import { Varuna } from "varuna";

export interface Performance {
  playerCountPeriod: PlayerCountPeriod;
}

export type PlayerCountPeriod = keyof Samples;

export const Performance = new Varuna<Performance>({
  playerCountPeriod: "total",
});
