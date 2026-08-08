import { $ } from "bun";
import { range } from "lodash-es";
import { compress, decompress } from "lz4js";
import { mkdir, rm } from "node:fs/promises";
import { IdArray } from "./idArray";

interface ManifestV1 {
  version: 1;
  last_verified: number;
}

interface RegionDescriptor {
  domain: string;
  seed: number;
  max: number;
  streak: number;
}

export interface QuickInfo {
  status: string;
  data: Record<string, {} | null>;
}

const TEMP = "../../temp";
const WORKING_DIR = `${TEMP}/ids`;
const CHUNKS_DIR = `${WORKING_DIR}/chunks`;
const REPO = "blitzkit/ids";

const ACCOMMODATED_ID_COUNT = 10_000_000_000; // 10B ids
const MAX_BYTES_PER_CHUNK = 100 * 1_000_000; // 100MB

const MAX_IDS_PER_CALL = 100;
const API_RATE = 10; // 10Hz
const MAX_DRY_STREAK = 10_000;

const chunkCount = Math.ceil(
  (ACCOMMODATED_ID_COUNT * Uint32Array.BYTES_PER_ELEMENT) / MAX_BYTES_PER_CHUNK,
);

console.log(
  `${chunkCount.toLocaleString()} will be needed for ${ACCOMMODATED_ID_COUNT.toLocaleString()} ids`,
);

const t0 = performance.now();
// const maxT = 5 * 60 * 60 * 1000; // 5hr
const maxT = 60 * 1000;
const t1 = t0 + maxT;

await mkdir(TEMP, { recursive: true });
await rm(WORKING_DIR, { recursive: true, force: true });

console.log(`Cloning ${REPO} to ${WORKING_DIR}`);

await $`git clone --depth 1 https://github.com/${REPO} ${WORKING_DIR}`;
await mkdir(CHUNKS_DIR, { recursive: true });

console.log(`Discovering pre-existing chunks...`);

const discoveredChunks: (IdArray | null)[] = [];

for (let i = 0; true; i++) {
  const path = `${CHUNKS_DIR}/chunk-${i}.dat.lz4`;
  const file = Bun.file(path);

  if (!(await file.exists())) break;

  const bytes = await file.bytes();
  const uncompressed = decompress(bytes);

  const ids = IdArray.fromBytes(uncompressed);

  discoveredChunks.push(ids);
}

console.log(`Found ${discoveredChunks.length} pre-existing chunks`);

let chunks: IdArray[] = [];

if (discoveredChunks.length === chunkCount) {
  console.log("Pre-existing chunking is consistent, passing as-is...");

  chunks = discoveredChunks as IdArray[];
} else {
  console.log("Pre-existing chunking is not consistent, re-chunking...");

  chunks = Array.from({ length: chunkCount }).map(() => new IdArray());

  for (let i = 0; i < discoveredChunks.length; i++) {
    const ids = discoveredChunks[i];
    const size = ids!.size();

    for (let j = 0; j < size; j++) {
      const id = ids!.get(j);
      const chunk = chunks[id % chunkCount];

      chunk.push(id);
    }

    discoveredChunks[i] = null;
  }

  console.log("Sorting chunks...");

  for (let i = 0; i < chunks.length; i++) chunks[i].sort();
}

const regions: RegionDescriptor[] = [
  { domain: "eu", seed: 5e8, max: 10e8 - 1, streak: 0 },
  { domain: "com", seed: 10e8, max: 20e8 - 1, streak: 0 },
  { domain: "asia", seed: 20e8, max: 31e8 - 1, streak: 0 },
];

console.log("Finding new seed ids...");

for (let i = 0; i < chunkCount; i++) {
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

console.log("Starting discovery loop...");

const queue: { region: RegionDescriptor; url: string; size: number }[] = [];
const applicationId = import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID;
const fields = "account_id%2C-account_id";
let regionI = 0;

function fillQueue() {
  if (queue.length >= 1) return;

  regionI = (regionI + 1) % regions.length;
  const region = regions[regionI];

  if (region.streak >= MAX_DRY_STREAK) {
    console.log(
      `Removing region ${region.domain} removed due to ${region.streak} dry streak...`,
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

  queue.push({ region, url, size: idRange.length });

  if (idRange.length < MAX_IDS_PER_CALL) {
    console.log(
      `Removing region ${region.domain} removed due to ID range exhaustion...`,
    );
    regions.splice(regionI, 1);
  }
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 1000 / API_RATE));
}

while (performance.now() < t1 && regions.length > 0) {
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
    const chunkIndex = id % chunkCount;
    const chunk = chunks[chunkIndex];

    chunk.push(id);
  }

  if (foundIds === 0) {
    request.region.streak += request.size;
  } else {
    // console.log(`Found ${foundIds} ids in ${request.region.domain}`);
  }
}

console.log("Saving chunks...");

await rm(`${CHUNKS_DIR}/*`, { force: true });

let totalFound = 0;

for (let i = 0; i < chunks.length; i++) {
  const path = `${CHUNKS_DIR}/chunk-${i}.dat.lz4`;
  const chunk = chunks[i];
  const bytes = chunk.toBytes();
  const compressed = compress(bytes);

  totalFound += chunk.size();

  await Bun.write(path, compressed);
}

const git = $.cwd(WORKING_DIR);

await git`git add .`.quiet();
await git`git commit --amend -m "ids update ${new Date().toISOString()}"`.quiet();
await git`git push --force-with-lease`.quiet();

console.log(
  `Committed ${totalFound.toLocaleString()} total ids across ${chunkCount} chunks`,
);
