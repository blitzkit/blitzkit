import { Varuna } from "varuna";

export type DeltaMode = "none" | "percentage" | "absolute";

export interface ComparePersistent {
  deltaMode: DeltaMode;
}

export const ComparePersistent = new Varuna<ComparePersistent>(
  { deltaMode: "none" },
  "compare-2"
);
