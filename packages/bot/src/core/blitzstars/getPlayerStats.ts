import type { BlitzStats, Region } from "@blitzkit/core";

interface IndividualPlayerStats {
  clan: { clan_id: number; name: string; tag: string };
  statistics: {
    all: BlitzStats;
    wn8: number;
    wn7: number;
    average_tier: number;
  };
  last_battle_time: number;
  nickname: string;
  account_id: number;
  achievements: {
    account_id: number;
    [key: string]: number;
  };
  region: Region;
}

export type PlayerStats = IndividualPlayerStats[];

export async function getPlayerStats<
  Ids extends number | number[],
  ReturnType = Ids extends number ? PlayerStats : PlayerStats[],
>(region: Region, ids: Ids) {
  const stats = await Promise.all(
    ((typeof ids === "number" ? [ids] : ids) as number[]).map((id) =>
      fetch(`https://www.blitzstars.com/api/playerstats/${id}`).then(
        (response) => response.json() as Promise<PlayerStats>
      )
    )
  );

  if (typeof ids === "number") return stats[0] as ReturnType;
  return stats as ReturnType;
}
