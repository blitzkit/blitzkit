import { type IndividualTankStats } from "@blitzkit/core";
import { Soapstone } from "soapstone";

type EmbedBreakdown = Record<number, IndividualTankStats[]>;

export const EmbedBreakdown = new Soapstone<EmbedBreakdown>(
  {},
  "embed-breakdown-2"
);
