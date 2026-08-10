import { range } from "lodash-es";
import { compress, decompress } from "lz4js";
import { exit } from "node:process";
import { GitObjectStorage } from "../core/blitzkit/gitObjectStorage";
import { IdArray } from "../core/blitzkit/idArray";
import {
  ACCOMMODATED_ID_COUNT,
  API_RATE,
  MAX_BYTES_PER_CHUNK,
  MAX_DRY_STREAK,
  MAX_IDS_PER_CALL,
  REPO,
  WORKING_DIR,
} from "./constants";
import { ManifestV1, QuickInfo, RegionDescriptor } from "./types";

const storage = await new GitObjectStorage(
  REPO,
  WORKING_DIR,
  import.meta.env.GH_TOKEN,
).init();

const t0 = performance.now();
const maxT = 5.5 * 60 * 60 * 1000; // 5hr 30min
const t1 = t0 + maxT;

await storage.mkdir("chunks");

console.log(`Discovering pre-existing chunks...`);

const discoveredChunks: (IdArray | null)[] = [];

const manifest = await storage.json<ManifestV1>("manifest.json");

for (let i = 0; i < manifest.chunks; i++) {
  const bytes = await storage.bytes(`chunks/chunk-${i}.dat.lz4`);
  const uncompressed = decompress(bytes);
  const ids = IdArray.fromBytes(uncompressed);

  discoveredChunks.push(ids);
}

console.log(`Found ${manifest.chunks} pre-existing chunks`);

manifest.chunks = Math.ceil(
  (ACCOMMODATED_ID_COUNT * Uint32Array.BYTES_PER_ELEMENT) / MAX_BYTES_PER_CHUNK,
);

let chunks: IdArray[] = [];

if (discoveredChunks.length === manifest.chunks) {
  console.log("Pre-existing chunking is consistent, passing as-is...");

  chunks = discoveredChunks as IdArray[];
} else {
  console.log("Pre-existing chunking is not consistent, re-chunking...");

  chunks = Array.from({ length: manifest.chunks }).map(() => new IdArray());

  for (let i = 0; i < discoveredChunks.length; i++) {
    const ids = discoveredChunks[i];
    const size = ids!.size();

    for (let j = 0; j < size; j++) {
      const id = ids!.get(j);
      const chunk = chunks[id % manifest.chunks];

      chunk.push(id);
    }

    discoveredChunks[i] = null;
  }

  console.log("Sorting chunks...");

  for (let i = 0; i < chunks.length; i++) chunks[i].sort();
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

const queue: { region: RegionDescriptor; url: string; size: number }[] = [];
const applicationId = import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID;
const fields = "account_id%2C-account_id";
let regionI = 0;

function fillQueue() {
  if (queue.length >= 1) return;

  while (regions.length > 0) {
    regionI = (regionI + 1) % regions.length;
    const region = regions[regionI];

    if (region.dry_streak >= MAX_DRY_STREAK) {
      console.log(
        `Removing region ${region.domain} removed due to ${region.dry_streak} dry streak...`,
      );
      regions.splice(regionI, 1);
      continue;
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

    queue.push({ region, url, size: idRange.length });

    if (idRange.length < MAX_IDS_PER_CALL) {
      console.log(
        `Removing region ${region.domain} removed due to ID range exhaustion...`,
      );
      regions.splice(regionI, 1);
    }

    return;
  }
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 1000 / API_RATE));
}

function withinTimeLimit() {
  return performance.now() < t1;
}

console.log("Starting discovery loop...");

while (withinTimeLimit() && regions.length > 0) {
  await sleep();

  fillQueue();

  if (queue.length === 0) {
    console.log("Queue empty, ending discovery loop...");
    break;
  }

  const request = queue.shift()!;
  const response = await fetch(request.url);
  const data = (await response.json()) as QuickInfo;

  if (data.status !== "ok") {
    console.warn("Failed API call; pushing back into queue...");
    queue.push(request);

    continue;
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
    request.region.dry_streak += request.size;
  } else {
    request.region.dry_streak = 0;
    // console.log(`Found ${foundIds} ids in ${request.region.domain}`);
  }
}

// console.log("Starting verification loop...");

// while (withinTimeLimit()) {
//   const verificationIndex = (manifest.last_verified + 1) % manifest.chunks;
//   manifest.last_verified = verificationIndex;
//   const chunk = chunks[verificationIndex];
//   const size = chunk.size();

//   let i0 = 0;
//   while (withinTimeLimit() && i0 < size) {
//     await sleep();

//     const i1 = Math.min(i0 + MAX_IDS_PER_CALL - 1, size - 1);
//     const indices = range(i0, i1 + 1);
//   }

//   console.log(`Verification complete for chunk ${verificationIndex}`);
// }

await save();
