import { context } from "../blitzkit/context";
import { Region } from "./regions";
import { regionToRegionSubdomain } from "./regionToRegionSubdomain";

type CurrentRatingPlayerSearch = Record<
  number,
  {
    spa_id: number;
    nickname: string;
    clan_tag: string;
  } & (
    | {
        skip: true;
      }
    | {
        skip: false;
        mmr: number;
        season_number: number;
        calibrationBattlesLeft: number;
        number: number;
        updated_at: string;
        neighbors: [];
      }
  )
>;

export async function searchCurrentRatingPlayers(region: Region, name: string) {
  const encodedSearch = encodeURIComponent(name);
  const response = await fetch(
    context === "website"
      ? `/api/${region}/rating/current/search/${encodedSearch}`
      : `https://${regionToRegionSubdomain(
          region
        )}.wotblitz.com/en/api/rating-leaderboards/search/?prefix=${encodedSearch}`,
    { cache: "no-store" }
  );
  const accountList = (await response.json()) as CurrentRatingPlayerSearch;

  return accountList;
}
