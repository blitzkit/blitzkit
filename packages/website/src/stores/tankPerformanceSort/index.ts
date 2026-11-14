import type en from "@blitzkit/i18n/strings/en.json";
import { Soapstone } from "soapstone";

export type TankPerformanceSortType =
  keyof typeof en.website.tools.performance.table.stats;

export interface TankPerformanceSort {
  type: TankPerformanceSortType;
  direction: -1 | 1;
}

export const TankPerformanceSort = new Soapstone<TankPerformanceSort>({
  type: "winrate",
  direction: -1,
});
