import { context } from "../blitzkit/context";
import { patientFetch } from "../blitzkit/patientFetch";
import type { RatingLeague, RatingReward } from "./rating";
import type { Region } from "./regions";
import { regionToRegionSubdomain } from "./regionToRegionSubdomain";

export type RatingInfo =
  | {
      detail: undefined;

      title: string;
      icon: string | null;
      start_at: string;
      finish_at: string;
      current_season: number;
      updated_at: string;
      count: number;

      rewards: RatingReward[];
      leagues: RatingLeague[];
    }
  | { detail: { error: string } };

const cache: Partial<Record<Region, RatingInfo>> = {};

export async function getRatingInfo(region: Region) {
  if (cache[region]) return cache[region]!;

  const response = await patientFetch(
    context === "website"
      ? `/api/${region}/rating/current/info`
      : `https://${regionToRegionSubdomain(
          region
        )}.wotblitz.com/en/api/rating-leaderboards/season/`,
    undefined
  );
  const data = (await response.json()) as RatingInfo;

  cache[region] = data;

  return data;
}
