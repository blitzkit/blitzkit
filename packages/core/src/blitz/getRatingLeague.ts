import { context } from "../blitzkit/context";
import { patientFetch } from "../blitzkit/patientFetch";
import type { RatingPlayer } from "../statistics";
import type { LeagueTop } from "./rating";
import type { Region } from "./regions";
import { regionToRegionSubdomain } from "./regionToRegionSubdomain";

export async function getRatingLeague(
  region: Region,
  league: number,
  usePatientFetcher = false
) {
  const fetcher = (url: string) =>
    usePatientFetcher
      ? patientFetch(url, undefined, { cache: "no-store" })
      : fetch(url, { cache: "no-store" });
  const response = await fetcher(
    context === "website"
      ? `/api/${region}/rating/current/league/${league}`
      : `https://${regionToRegionSubdomain(
          region
        )}.wotblitz.com/en/api/rating-leaderboards/league/${league}/top/`
  );
  const json = await response.json();

  return context === "website"
    ? (json as RatingPlayer[])
    : (json as LeagueTop).result;
}
