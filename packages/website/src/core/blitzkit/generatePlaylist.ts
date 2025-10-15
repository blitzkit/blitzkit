import {
  fisherYates,
  getTankStats,
  idToRegion,
  type IndividualTankStats,
} from "@blitzkit/core";
import { App } from "../../stores/app";
import { Playlist } from "../../stores/playlist";
import { TankFilters } from "../../stores/tankFilters";
import { awaitableTankDefinitions } from "../awaitables/tankDefinitions";
import { filterTanks } from "./filterTanks";

const tankDefinitions = await awaitableTankDefinitions;
const tanks = Object.values(tankDefinitions.tanks);

export async function generatePlaylist() {
  const id = App.state.logins.wargaming?.id;
  const filtered = await filterTanks(TankFilters.state, tanks, id);
  const statsList = id ? await getTankStats(idToRegion(id), id) : undefined;
  const stats: Record<number, IndividualTankStats> = {};

  if (statsList) {
    for (const tankStat of statsList) {
      stats[tankStat.tank_id] = tankStat;
    }
  }

  fisherYates(filtered);

  Playlist.mutate((draft) => {
    draft.list = filtered.map((tank) => {
      const tankStats = stats[tank.id];
      const then = tankStats
        ? {
            battles: tankStats.all.battles,
            wins: tankStats.all.wins,
            last: tankStats.last_battle_time,
          }
        : undefined;

      return { id: tank.id, then, now: then };
    });
  });
}
