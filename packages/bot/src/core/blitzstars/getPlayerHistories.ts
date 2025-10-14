import { type Region, emptyAllStats, getAccountInfo } from '@blitzkit/core';
import {
  type GetHistoriesOptions,
  type Histories,
  type History,
  getHistoriesDefaultOptions,
} from '../../types/histories';
import type { PlayerStats } from './getPlayerStats';

export async function getPlayerHistories(
  server: Region,
  id: number,
  options?: Partial<GetHistoriesOptions>,
) {
  const mergedOptions = { ...getHistoriesDefaultOptions, ...options };
  const response = await fetch(
    `https://www.blitzstars.com/api/playerstats/${id}`,
  );
  const playerHistories = ((await response.json()) as PlayerStats).map(
    (history) =>
      ({
        all: history.statistics.all,
        last_battle_time: history.last_battle_time,
      }) satisfies History,
  );
  let lastNonCompliantIndex = -1;
  let hasCompliedOnce = false;
  const filtered = playerHistories.filter(({ last_battle_time }, index) => {
    const complies =
      last_battle_time >= mergedOptions.start &&
      last_battle_time <= mergedOptions.end;

    if (complies && !hasCompliedOnce) hasCompliedOnce = true;
    if (!hasCompliedOnce) lastNonCompliantIndex = index;

    return complies;
  });

  const latestNodes: Histories = [];

  if (mergedOptions.includeLatestHistories) {
    const { last_battle_time, statistics } = await getAccountInfo(server, id);

    latestNodes.push({ all: statistics.all, last_battle_time });
  }

  const previousNodes: Histories = [];

  if (mergedOptions.includePreviousHistories) {
    if (lastNonCompliantIndex !== -1) {
      previousNodes.push(
        playerHistories[lastNonCompliantIndex] ??
          ({
            all: emptyAllStats,
            last_battle_time: -Infinity,
          } satisfies History),
      );
    }
  }

  return [...latestNodes, ...filtered, ...previousNodes] satisfies Histories;
}
