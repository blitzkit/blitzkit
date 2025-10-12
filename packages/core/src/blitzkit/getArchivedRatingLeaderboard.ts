import { Region } from "../blitz/regions";
import { RatingLeaderboard } from "../protos";
import { asset } from "./asset";

const cache: Record<Region, Record<number, RatingLeaderboard>> = {
  asia: {},
  eu: {},
  com: {},
};

export async function getArchivedRatingLeaderboard(
  region: Region,
  season: number
) {
  if (!cache[region][season]) {
    const info = await fetch(asset(`regions/${region}/rating/${season}.pb`))
      .then((response) => response.arrayBuffer())
      .then((buffer) => RatingLeaderboard.decode(new Uint8Array(buffer)));
    cache[region][season] = info;
  }

  return cache[region][season];
}
