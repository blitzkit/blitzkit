import {
  AverageDefinitions,
  AverageDefinitionsEntry,
  type AverageDefinitionsManifest,
  type IndividualTankStats,
  REGIONS,
  type Region,
  Samples,
  averageDefinitionsAllStatsKeys,
  emptySamples,
  getAccountInfo,
  getTankStats,
  idToRegion,
} from "@blitzkit/core";
import { chunk, times } from "lodash-es";
import { AssetUploader } from "./core/github/assetUploader";
import { fetchPreDiscoveredIds } from "./core/github/fetchPreDiscoveredIds";

interface DataPoint {
  x: number;
  y: number;
  w: number;
}

type OptionalSecondLevel<T> = {
  [P in keyof T]: P extends "samples"
    ? T[P]
    : {
        [K in keyof T[P]]?: T[P][K];
      };
};

type AverageDefinitionsEntrySubPartial =
  OptionalSecondLevel<AverageDefinitionsEntry>;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
// const MAX_ACTIVITY_TIME = 120 * DAY;
// const MIN_BATTLES = 5000;
const RUN_TIME = 5 * HOUR + 55 * MINUTE;
const THREADS = 10;
const PLAYER_IDS_PER_CALL = 100;

const startTime = Date.now();
const preDiscoveredIds = await fetchPreDiscoveredIds();
const playerIds: Record<Region, number[][]> = {
  asia: chunk(
    preDiscoveredIds.filter((id) => idToRegion(id) === "asia"),
    PLAYER_IDS_PER_CALL
  ),
  com: chunk(
    preDiscoveredIds.filter((id) => idToRegion(id) === "com"),
    PLAYER_IDS_PER_CALL
  ),
  eu: chunk(
    preDiscoveredIds.filter((id) => idToRegion(id) === "eu"),
    PLAYER_IDS_PER_CALL
  ),
};
let regionIndex = 0;
const samples: Samples = { ...emptySamples };
const availableRegions = [...REGIONS];
const tankIds: number[] = [];
const tanksSorted: Record<number, IndividualTankStats[]> = {};
let postWorkRequested = false;

times(THREADS, async () => {
  while (availableRegions.length > 0 && startTime + RUN_TIME > Date.now()) {
    const region = availableRegions[regionIndex];
    const regionIds = playerIds[region];
    const [ids] = regionIds.splice(
      Math.floor(Math.random() * regionIds.length),
      1
    );
    const accountInfo = await getAccountInfo(region, ids, undefined, {
      fields: "last_battle_time,statistics.all.battles",
    });

    const filteredIds = ids.filter((_, index) => {
      const info = accountInfo[index];

      if (info === null) return false;

      const timeSinceLastActivity = Date.now() - info.last_battle_time * 1000;

      samples.total++;
      if (timeSinceLastActivity <= 120 * DAY) samples.d_120++;
      if (timeSinceLastActivity <= 90 * DAY) samples.d_90++;
      if (timeSinceLastActivity <= 60 * DAY) samples.d_60++;
      if (timeSinceLastActivity <= 30 * DAY) samples.d_30++;
      if (timeSinceLastActivity <= 7 * DAY) samples.d_7++;
      if (timeSinceLastActivity <= 1 * DAY) samples.d_1++;

      return true;

      // return (
      //   timeSinceLastActivity <= MAX_ACTIVITY_TIME &&
      //   info.statistics.all.battles > MIN_BATTLES
      // );
    });

    const players = await Promise.all(
      filteredIds.map((id) =>
        getTankStats(region, id, {
          fields: "last_battle_time,battle_life_time,all,tank_id",
        })
      )
    );

    players.forEach((tanks) => {
      tanks?.forEach((tank) => {
        if (tank.all.battles === 0) return;

        if (!tankIds.includes(tank.tank_id)) {
          console.log(
            `Found new tank: ${tank.tank_id} (${tankIds.length + 1})`
          );
          tankIds.push(tank.tank_id);
          tanksSorted[tank.tank_id] = [];
        }

        tanksSorted[tank.tank_id].push(tank);
      });
    });

    if (regionIds.length === 0 && availableRegions.includes(region)) {
      availableRegions.splice(availableRegions.indexOf(region), 1);
    }
    regionIndex = (regionIndex + 1) % availableRegions.length;
  }

  if (!postWorkRequested) {
    postWorkRequested = true;
    postWork();
  }
});

async function postWork() {
  console.log(
    `Generating statistics based on ${samples.d_120.toLocaleString()} players (${samples.total.toLocaleString()} checked in total) and ${
      tankIds.length
    } tanks...`
  );

  using uploader = new AssetUploader("averages");
  const averages: Record<number, AverageDefinitionsEntry> = {};

  tankIds.forEach((id) => {
    const tanksSortedEntry = tanksSorted[id];
    // const tanks = tanksSortedEntry.filter(
    //   (tank) => Date.now() - tank.last_battle_time * 1000 <= MAX_ACTIVITY_TIME,
    // );
    const tanks = tanksSortedEntry;
    const entry: AverageDefinitionsEntrySubPartial = {
      mu: {},
      sigma: {},
      r: {},
      samples: { ...emptySamples },
    };

    tanks.forEach((tank) => {
      const timeSinceLastActivity = Date.now() - tank.last_battle_time * 1000;

      entry.samples.total++;
      if (timeSinceLastActivity <= 120 * DAY) entry.samples.d_120++;
      if (timeSinceLastActivity <= 90 * DAY) entry.samples.d_90++;
      if (timeSinceLastActivity <= 60 * DAY) entry.samples.d_60++;
      if (timeSinceLastActivity <= 30 * DAY) entry.samples.d_30++;
      if (timeSinceLastActivity <= 7 * DAY) entry.samples.d_7++;
      if (timeSinceLastActivity <= 1 * DAY) entry.samples.d_1++;
    });

    const dataWY = tanks.map((tank) => ({
      w: tank.all.battles,
      y: tank.all.wins / tank.all.battles,
    }));

    averageDefinitionsAllStatsKeys.forEach((key) => {
      const data: DataPoint[] = dataWY.map(({ w, y }, index) => ({
        w,
        x:
          (key === "battle_life_time"
            ? tanks[index].battle_life_time
            : tanks[index].all[key]) / w,
        y,
      }));

      if (data.length === 0) return;

      function sum(slicer: (data: DataPoint) => number) {
        return data.reduce(
          (accumulator, data) => accumulator + slicer(data),
          0
        );
      }

      const sum_w = sum(({ w }) => w);
      const sum_wx = sum(({ w, x }) => w * x);
      const sum_wy = sum(({ w, y }) => w * y);
      const x_bar = sum_wx / sum_w;
      const y_bar = sum_wy / sum_w;
      // undo normalization for mu to get a simple average
      const mu = sum(({ w, x }) => w * x) / samples.d_120;

      const sigma_numerator = sum(({ w, x }) => w * (x - x_bar) ** 2);
      const sigma = Math.sqrt(sigma_numerator / sum_w);

      const r_numerator = sum(({ w, x, y }) => w * (x - x_bar) * (y - y_bar));
      const r_denominator_x = sum(({ w, x }) => w * (x - x_bar) ** 2);
      const r_denominator_y = sum(({ w, y }) => w * (y - y_bar) ** 2);
      const r = r_numerator / Math.sqrt(r_denominator_x * r_denominator_y);

      entry.mu[key] = mu;
      entry.sigma[key] = sigma;
      entry.r[key] = isNaN(r) ? 0 : r;
    });

    averages[id] = entry as AverageDefinitionsEntry;
  });

  const time = Date.now();
  const latest = Math.round(time / DAY);
  const averageDefinitions = {
    averages,
    samples,
    time,
  } satisfies AverageDefinitions;

  const manifest: AverageDefinitionsManifest = {
    version: 1,
    latest,
  };

  await uploader.add({
    path: `averages/${latest}.pb`,
    content: AverageDefinitions.encode(averageDefinitions).finish(),
  });
  await uploader.add({
    path: "averages/manifest.json",
    content: new TextEncoder().encode(JSON.stringify(manifest)),
  });

  await uploader.flush();
}
