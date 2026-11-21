import type { Samples } from "@blitzkit/protos";
import { Soapstone } from "soapstone";
import type { PerformanceStatName } from "../config/performanceStats";
import { SortDirection } from "./tankopediaPersistent";

export type PlayerCountPeriod = keyof Samples;

export interface PerformanceSort {
  by: PerformanceStatName;
  direction: SortDirection;
}

export interface Performance {
  player_count_period: PlayerCountPeriod;
  sorting: PerformanceSort;
}

export const Performance = new Soapstone<Performance>({
  player_count_period: "total",
  sorting: {
    by: "winrate",
    direction: SortDirection.Descending,
  },
});
