import {
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
  const filtered = await filterTanks(TankFilters.state, tanks);
  const statsList = id ? await getTankStats(idToRegion(id), id) : undefined;
  const stats: Record<number, IndividualTankStats> = {};

  if (statsList) {
    for (const tankStat of statsList) {
      stats[tankStat.tank_id] = tankStat;
    }
  }

  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  Playlist.mutate((draft) => {
    draft.list = filtered.map((tank, index) => ({
      index,
      tank,
      battles: stats[tank.id]?.all.battles,
      wins: stats[tank.id]?.all.wins,
    }));
  });
}
