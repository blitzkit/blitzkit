import { type IndividualTankStats } from "@blitzkit/core";
import { Varuna } from "varuna";

type EmbedBreakdown = Record<number, IndividualTankStats[]>;

export const EmbedBreakdown = new Varuna<EmbedBreakdown>(
  {},
  "embed-breakdown-2"
);
