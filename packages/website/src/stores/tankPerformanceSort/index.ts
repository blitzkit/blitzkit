import type en from "@blitzkit/i18n/strings/en.json";
import { Varuna } from "varuna";

export type TankPerformanceSortType =
  keyof typeof en.website.tools.performance.table.stats;

export interface TankPerformanceSort {
  type: TankPerformanceSortType;
  direction: -1 | 1;
}

export const TankPerformanceSort = new Varuna<TankPerformanceSort>({
  type: "winrate",
  direction: -1,
});
