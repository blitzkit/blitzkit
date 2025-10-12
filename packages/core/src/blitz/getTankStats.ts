import { TanksStats } from "../types";
import { FetchBlitzParams, fetchBlitz } from "./fetchBlitz";
import { Region } from "./regions";

export async function getTankStats(
  region: Region,
  id: number,
  params?: FetchBlitzParams
) {
  const tankStats = await fetchBlitz<TanksStats>(region, "tanks/stats", {
    account_id: id,
    ...params,
  });

  return tankStats[id];
}
