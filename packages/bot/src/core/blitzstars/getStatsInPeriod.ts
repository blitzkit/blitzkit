import { type BlitzStats, emptyAllStats, type Region } from "@blitzkit/core";
import { Locale } from "discord.js";
import type { DiffedTankStats } from "./filterStats";
import {
  getTankHistories,
  type TankHistories,
  type TankHistoryRaw,
} from "./getTankHistories";

const emptyTankHistoryNode: TankHistoryRaw = {
  account_id: 0,
  battle_life_time: 0,
  last_battle_time: 0,
  mark_of_mastery: 0,
  tank_id: 0,
  all: emptyAllStats,
};

// BIG TODO: merge this neatly with diffNormalizedTankStats
export async function getStatsInPeriod(
  server: Region,
  id: number,
  start: number,
  end: number,
  locale: Locale
) {
  const history = await getTankHistories(server, id, locale, {
    includeLatestHistories: true,
  });

  // sort them even though most won't be used
  const tankSortedHistory: Record<number, TankHistories> = {};
  const tanks: number[] = [];
  history.forEach((node) => {
    if (!tankSortedHistory[node.tank_id]) {
      tankSortedHistory[node.tank_id] = [node];
      tanks.push(node.tank_id);
    } else {
      tankSortedHistory[node.tank_id].push(node);
    }
  });

  // find the ones played within the range
  const inRangeTanks = tanks.filter((tankId) =>
    tankSortedHistory[tankId].some(
      (node) => node.last_battle_time > start && node.last_battle_time < end
    )
  );
  const playedTanks: number[] = [];

  // fetch history node right before "start" and right before "end"
  const diff: Record<number, BlitzStats> = {};
  inRangeTanks.forEach((tankId) => {
    const sortedHistory = tankSortedHistory[tankId];
    const previousIndex =
      sortedHistory.findIndex((node) => node.last_battle_time > start) - 1;
    const latestIndex =
      sortedHistory.findIndex((node) => node.last_battle_time > end) - 1;
    const previous = sortedHistory[previousIndex] ?? emptyTankHistoryNode;
    const latest =
      sortedHistory[latestIndex] ?? sortedHistory[sortedHistory.length - 1];

    function d(get: (allStats: BlitzStats) => number) {
      return get(latest.all) - get(previous.all);
    }

    // check if there was a change in battles as games in rating do update last_battle_time
    if (d((a) => a.battles) > 0) {
      diff[tankId] = {
        battles: d((a) => a.battles),
        capture_points: d((a) => a.capture_points),
        damage_dealt: d((a) => a.damage_dealt),
        damage_received: d((a) => a.damage_received),
        dropped_capture_points: d((a) => a.dropped_capture_points),
        frags: d((a) => a.frags),
        frags8p: d((a) => a.frags8p),
        hits: d((a) => a.hits),
        losses: d((a) => a.losses),
        max_frags: latest.all.max_frags,
        max_xp: latest.all.max_xp,
        shots: d((a) => a.shots),
        spotted: d((a) => a.spotted),
        survived_battles: d((a) => a.survived_battles),
        win_and_survived: d((a) => a.win_and_survived),
        wins: d((a) => a.wins),
        xp: d((a) => a.xp),
      };

      playedTanks.push(tankId);
    }
  });

  const order = playedTanks.sort((a, b) => {
    const aHistories = tankSortedHistory[a];
    const bHistories = tankSortedHistory[b];
    const aLatest = aHistories[aHistories.length - 1];
    const bLatest = bHistories[bHistories.length - 1];

    return bLatest.last_battle_time - aLatest.last_battle_time;
  });

  return { diff, order } satisfies DiffedTankStats;
}
