import { type Region, emptyAllStats, getTankStats } from "@blitzkit/core";
import { Locale } from "discord.js";
import {
  type GetHistoriesOptions,
  type Histories,
  type History,
  getHistoriesDefaultOptions,
} from "../../types/histories";
import { UserError } from "../blitzkit/userError";
import { translator } from "../localization/translator";

export interface TankHistory extends History {
  tank_id: number;
}

export type TankHistories = TankHistory[];

export interface TankHistoryRaw extends TankHistory {
  mark_of_mastery: number;
  battle_life_time: number;
  account_id: number;
}

export type TankHistoriesRaw = TankHistoryRaw[];

export interface GetTankHistoriesOptions extends GetHistoriesOptions {
  tankId?: number;
}

const getTankHistoriesDefaultOptions: GetTankHistoriesOptions = {
  ...getHistoriesDefaultOptions,
  tankId: undefined,
};

export async function getTankHistories(
  server: Region,
  id: number,
  locale: Locale,
  options?: Partial<GetTankHistoriesOptions>
) {
  const { strings } = translator(locale);
  const mergedOptions = { ...getTankHistoriesDefaultOptions, ...options };
  const tankHistoriesResponse = await fetch(
    `https://www.blitzstars.com/api/tankhistories/for/${id}/`
  );
  const tankHistories = (
    (await tankHistoriesResponse.json()) as TankHistoriesRaw
  ).map(
    (history) =>
      ({
        all: history.all,
        last_battle_time: history.last_battle_time,
        tank_id: history.tank_id,
      }) satisfies TankHistory
  );
  const compliantTanks: number[] = [];
  const lastBattles: Record<number, number> = {};
  const lastNonCompliantIndex: Record<number, number> = {};
  const hasCompliedOnce: Record<number, boolean> = {};
  const filtered = tankHistories.filter(
    ({ last_battle_time, tank_id, all: { battles } }, index) => {
      const complies =
        last_battle_time >= mergedOptions.start &&
        last_battle_time <= mergedOptions.end &&
        (mergedOptions.tankId === undefined ||
          tank_id === mergedOptions.tankId);

      if (complies && !hasCompliedOnce[tank_id]) {
        hasCompliedOnce[tank_id] = true;
        compliantTanks.push(tank_id);
      }
      if (!hasCompliedOnce[tank_id]) lastNonCompliantIndex[tank_id] = index;
      lastBattles[tank_id] = battles;

      return complies;
    }
  );

  const latestNodes: TankHistories = [];

  if (mergedOptions.includeLatestHistories) {
    const tankStats = await getTankStats(server, id);

    if (tankStats === null) {
      throw new UserError(strings.bot.common.errors.no_tank_stats);
    }

    tankStats.forEach((tankHistory) => {
      if (
        tankHistory.all.battles > (lastBattles[tankHistory.tank_id] ?? 0) &&
        (mergedOptions.tankId === undefined ||
          tankHistory.tank_id === mergedOptions.tankId)
      ) {
        if (!hasCompliedOnce[tankHistory.tank_id]) {
          // was played today for the first time... I think???
          hasCompliedOnce[tankHistory.tank_id] = true;
          compliantTanks.push(tankHistory.tank_id);
        }
        latestNodes.push(tankHistory);
      }
    });
  }

  const previousNodes: TankHistories = [];

  if (mergedOptions.includePreviousHistories) {
    compliantTanks.forEach((tankId) => {
      if (tankId in lastNonCompliantIndex) {
        previousNodes.push(
          tankHistories[lastNonCompliantIndex[tankId]] ??
            ({
              all: emptyAllStats,
              last_battle_time: -Infinity,
              tank_id: tankId,
            } satisfies TankHistory)
        );
      }
    });
  }

  return [...previousNodes, ...filtered, ...latestNodes] satisfies Histories;
}
