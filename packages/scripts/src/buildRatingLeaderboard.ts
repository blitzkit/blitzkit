import {
  getAccountInfo,
  patientFetchJSON,
  RatingInfo,
  RatingLeaderboard,
  RatingLeaderboardEntryV1,
  RatingLeaderboardEntryV2,
  RatingNeighbors,
  RatingPlayer,
  Region,
  REGIONS,
  regionToRegionSubdomain,
} from "@blitzkit/core";
import { chunk } from "lodash-es";
import { argv } from "process";
import { AssetUploader } from "./core/github/assetUploader";

const region = argv
  .find((arg) => arg.startsWith("--region="))
  ?.split("=")[1] as Region | undefined;

if (region === undefined || !REGIONS.includes(region)) {
  throw new Error("No valid region specified");
}

console.log(`Building rating leaderboard for ${region}`);

const regionSubdomain = regionToRegionSubdomain(region);
const NEIGHBORS = 2 ** 8;
const PLAYERS = await patientFetchJSON<RatingInfo>(
  `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/season/`
).then((data) => (data.detail === undefined ? data.count : undefined));

if (PLAYERS === undefined) {
  throw new Error("No current rating season running");
}

const players: Record<number, RatingPlayer> = {};
const entriesV1: RatingLeaderboardEntryV1[] = [];

let registered = 0;

async function branchFromPlayer(id: number) {
  const { neighbors } = await patientFetchJSON<RatingNeighbors>(
    `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${NEIGHBORS}`
  );

  const firstPlayer = neighbors[0];
  const lastPlayer = neighbors[neighbors.length - 1];

  const branches: Promise<void>[] = [];
  if (!players[firstPlayer.number])
    branches.push(branchFromPlayer(firstPlayer.spa_id));
  if (!players[lastPlayer.number])
    branches.push(branchFromPlayer(lastPlayer.spa_id));

  neighbors.forEach((neighbor) => {
    if (players[neighbor.number]) return;

    players[neighbor.number] = neighbor;
    registered++;
  });

  console.log(
    `Registered ${registered} / ${PLAYERS} (${(
      (registered / PLAYERS!) *
      100
    ).toFixed(2)}%)`
  );

  await Promise.all(branches);
}

async function branchFromLeague(id: number) {
  const { result } = await patientFetchJSON<{ result: RatingPlayer[] }>(
    `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/league/${id}/top/`
  );

  const firstPlayer = result[0];
  const lastPlayer = result.at(-1)!;

  await Promise.all([
    branchFromPlayer(firstPlayer.spa_id),
    branchFromPlayer(lastPlayer.spa_id),
  ]);
}

console.log("Branching from leagues...");
await Promise.all([
  branchFromLeague(0),
  branchFromLeague(1),
  branchFromLeague(2),
  branchFromLeague(3),
  branchFromLeague(4),
]);

console.log("Converting to an array...");
for (let index = 0; index < PLAYERS; index++) {
  const listing = players[index + 1];
  if (listing) {
    entriesV1[index] = { id: listing.spa_id, score: listing.score };
  } else {
    console.warn(`Position ${index + 1} had no player`);
    entriesV1[index] = { id: 0, score: 0 };
  }
}

console.log("Requesting further stats...");
const entries: RatingLeaderboardEntryV2[] = [];
let chunkIndex = 0;
for (const leaderboardChunk of chunk(entriesV1, 100)) {
  console.log(
    `Chunk ${chunkIndex + 1} of ${Math.ceil(entriesV1.length / 100)}`
  );

  const stats = await getAccountInfo(
    region,
    leaderboardChunk.map(({ id }) => id),
    ["statistics.rating"]
  );

  stats.forEach((stat, index) => {
    const trueIndex = chunkIndex * 100 + index;

    if (
      leaderboardChunk[index].id === 0 ||
      stat?.statistics.rating === undefined
    ) {
      entries[trueIndex] = {
        battles: 0,
        damage: 0,
        id: 0,
        kills: 0,
        score: 0,
        survived: 0,
        wins: 0,
      };
    } else {
      entries[trueIndex] = {
        id: leaderboardChunk[index].id,
        score: leaderboardChunk[index].score,
        battles: stat.statistics.rating.battles,
        damage: stat.statistics.rating.damage_dealt,
        kills: stat.statistics.rating.frags,
        survived: stat.statistics.rating.survived_battles,
        wins: stat.statistics.rating.wins,
      };
    }
  });

  chunkIndex++;
}

const info = await patientFetchJSON<RatingInfo & { detail: undefined }>(
  `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/season/`
);
const normalizedServer = regionSubdomain === "na" ? "com" : regionSubdomain;
const content = RatingLeaderboard.encode({
  version: { $case: "v2", value: { entries } },
}).finish();

using uploader = new AssetUploader(`rating leaderboard ${regionSubdomain}`);

await uploader.add({
  path: `regions/${normalizedServer}/rating/${info.current_season}.pb`,
  content,
});

await uploader.flush();
