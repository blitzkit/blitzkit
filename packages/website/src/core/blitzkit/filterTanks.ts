import { getTankStats, idToRegion, TankDefinition } from "@blitzkit/core";
import { TankFilters } from "../../stores/tankFilters";
import { filterTank } from "./filterTank";

export async function filterTanks(
  filters: TankFilters,
  tanks: TankDefinition[],
  player?: number
) {
  const filtered: TankDefinition[] = [];
  let owned: number[] | undefined;

  if (player) {
    const tankStats = await getTankStats(idToRegion(player), player, {
      fields: "tank_id",
    });

    owned = tankStats?.map(({ tank_id }) => tank_id);
  }

  for (const tank of tanks) {
    if (await filterTank(filters, tank, owned)) filtered.push(tank);
  }

  return filtered;
}
