import type { Samples } from "@blitzkit/protos";
import { Soapstone } from "soapstone";

export interface Performance {
  playerCountPeriod: PlayerCountPeriod;
}

export type PlayerCountPeriod = keyof Samples;

export const Performance = new Soapstone<Performance>({
  playerCountPeriod: "total",
});
