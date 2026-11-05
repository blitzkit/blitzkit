import { Soapstone } from "soapstone";

export type DeltaMode = "none" | "percentage" | "absolute";

export interface ComparePersistent {
  deltaMode: DeltaMode;
}

export const ComparePersistent = new Soapstone<ComparePersistent>(
  { deltaMode: "none" },
  "compare-2"
);
