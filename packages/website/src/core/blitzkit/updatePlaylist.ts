import {
  getTankStats,
  idToRegion,
  type IndividualTankStats,
} from "@blitzkit/core";
import { App } from "../../stores/app";
import { Playlist } from "../../stores/playlist";

export async function updatePlaylist() {
  const id = App.state.logins.wargaming?.id;
  const statsList = id ? await getTankStats(idToRegion(id), id) : undefined;
  const stats: Record<number, IndividualTankStats> = {};

  if (statsList) {
    for (const tankStat of statsList) {
      stats[tankStat.tank_id] = tankStat;
    }
  }

  Playlist.mutate((draft) => {
    draft.list?.map((item) => {
      const tankStats = stats[item.id];
      item.now = tankStats
        ? {
            battles: tankStats.all.battles,
            wins: tankStats.all.wins,
            last: tankStats.last_battle_time,
          }
        : undefined;
    });
  });
}
