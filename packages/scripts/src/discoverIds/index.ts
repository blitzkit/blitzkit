import { range } from "lodash-es";
import { compress } from "lz4js";
import { exit } from "node:process";
import { GitObjectStorage } from "../core/blitzkit/gitObjectStorage";
import { IdArray } from "../core/blitzkit/idArray";
import { CHUNK_COUNT, MAX_DRY_STREAK, MAX_IDS_PER_CALL } from "./constants";
import { atMaxRate } from "./time";
import { IdsManifest, QuickInfo, RegionDescriptor } from "./types";

const storage = await new GitObjectStorage(
  "blitzkit/data-ids",
  "../../temp/ids",
  import.meta.env.GH_TOKEN,
).init();

await storage.mkdir("chunks");

console.log(`Discovering pre-existing chunks...`);

const discoveredChunks: (IdArray | null)[] = [];

const manifest = await storage.json<IdsManifest>("manifest.json");

for (let i = 0; i < manifest.chunks; i++) {
  const bytes = await storage.bytes(`chunks/chunk-${i}.dat.lz4`);
  const ids = IdArray.fromCompressed(bytes);

  discoveredChunks.push(ids);
}

console.log(`Found ${manifest.chunks} pre-existing chunks`);

let chunks: IdArray[] = [];

if (manifest.chunks === CHUNK_COUNT) {
  console.log("Pre-existing chunking is consistent, passing as-is...");

  chunks = discoveredChunks as IdArray[];
} else {
  console.log("Pre-existing chunking is not consistent, re-chunking...");

  chunks = Array.from({ length: CHUNK_COUNT }).map(() => new IdArray());

  for (let i = 0; i < discoveredChunks.length; i++) {
    const ids = discoveredChunks[i];
    const size = ids!.size();

    for (let j = 0; j < size; j++) {
      const id = ids!.get(j);
      const chunk = chunks[id % CHUNK_COUNT];

      chunk.push(id);
    }

    discoveredChunks[i] = null;
  }

  console.log("Sorting chunks...");

  for (let i = 0; i < chunks.length; i++) chunks[i].sort();

  manifest.chunks = CHUNK_COUNT;
  manifest.last_verified = manifest.last_verified % CHUNK_COUNT;
}

const regions: RegionDescriptor[] = [
  { domain: "eu", seed: 5e8, max: 10e8 - 1, dry_streak: 0 },
  { domain: "com", seed: 10e8, max: 20e8 - 1, dry_streak: 0 },
  { domain: "asia", seed: 20e8, max: 31e8 - 1, dry_streak: 0 },
];

console.log("Finding new seed ids...");

for (let i = 0; i < manifest.chunks; i++) {
  const chunk = chunks[i];
  const size = chunk.size();

  for (let j = 0; j < size; j++) {
    const id = chunk.get(j);

    for (const region of regions) {
      if (id <= region.max && id >= region.seed) {
        region.seed = id + 1;
      }
    }
  }
}

console.log("Found seeds:");

for (const region of regions) {
  console.log(`  ${region.domain}: ${region.seed.toLocaleString()}`);
}

let isSaving = false;
async function save() {
  if (isSaving) return;

  isSaving = true;

  console.log("Saving chunks...");

  await storage.rm("chunks/*");

  let totalFound = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const bytes = chunk.toBytes();
    const compressed = compress(bytes);

    totalFound += chunk.size();

    await storage.write(`chunks/chunk-${i}.dat.lz4`, compressed);
  }

  manifest.total_count = totalFound;

  await storage.write("manifest.json", JSON.stringify(manifest, null, 2));
  await storage.commit();

  console.log(
    `Committed ${totalFound.toLocaleString()} total ids across ${manifest.chunks} chunks`,
  );

  exit(0);
}

process.on("SIGINT", save);
process.on("SIGTERM", save);

const applicationId = import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID;
const fields = "account_id%2C-account_id";
let regionI = 0;

console.log("Starting discovery loop...");

atMaxRate(async ({ _break: break1 }) => {
  if (regions.length === 0) {
    console.log("All regions exhausted, exiting discovery loop...");
    return break1();
  }

  regionI = (regionI + 1) % regions.length;
  const region = regions[regionI];

  if (region.dry_streak >= MAX_DRY_STREAK) {
    console.log(
      `Removing region ${region.domain} removed due to ${region.dry_streak} dry streak...`,
    );
    regions.splice(regionI, 1);

    return;
  }

  const id0 = region.seed;
  const id1 = Math.min(id0 + MAX_IDS_PER_CALL - 1, region.max);
  const idRange = range(id0, id1 + 1);

  region.seed += idRange.length;

  const accountIds = idRange.join(",");
  const url = `https://api.wotblitz.${
    region.domain
  }/wotb/account/info/?application_id=${applicationId}&fields=${
    fields
  }&account_id=${accountIds}`;

  atMaxRate(async ({ _break: break2 }) => {
    if (idRange.length < MAX_IDS_PER_CALL) {
      console.log(
        `Removing region ${region.domain} removed due to ID range exhaustion...`,
      );
      regions.splice(regionI, 1);
    }

    const response = await fetch(url);
    const data = (await response.json()) as QuickInfo;

    if (data.status !== "ok") {
      console.warn("Failed API call; trying again...");
      return;
    }

    let foundIds = 0;

    for (const key in data.data) {
      const value = data.data[key];

      if (value === null) continue;

      foundIds++;

      const id = Number(key);
      const chunkIndex = id % manifest.chunks;
      const chunk = chunks[chunkIndex];

      chunk.push(id);
    }

    if (foundIds === 0) {
      region.dry_streak += idRange.length;
    } else {
      region.dry_streak = 0;
      // console.log(`Found ${foundIds} ids in ${request.region.domain}`);
    }

    break2();
  });
});

await save();
