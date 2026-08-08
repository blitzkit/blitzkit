import { $ } from "bun";
import { compress, uncompress } from "lz4-napi";
import { mkdir, rm } from "node:fs/promises";
import { IdArray } from "./idArray";

interface ManifestV1 {
  version: 1;
  last_verified: number;
}

const TEMP = "../../temp";
const WORKING_DIR = `${TEMP}/ids`;
const CHUNKS_DIR = `${WORKING_DIR}/chunks`;
const REPO = "blitzkit/ids";

const ACCOMMODATED_ID_COUNT = 10_000_000_000; // 10B ids
const MAX_BYTES_PER_CHUNK = 100 * 1_000_000; // 100MB

// const chunkCount = Math.ceil(
//   (ACCOMMODATED_ID_COUNT * Uint32Array.BYTES_PER_ELEMENT) / MAX_BYTES_PER_CHUNK,
// );
const chunkCount = 2;

console.log(
  `${chunkCount.toLocaleString()} will be needed for ${ACCOMMODATED_ID_COUNT.toLocaleString()} ids`,
);

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
  const uncompressed = await uncompress(bytes);

  const ids = IdArray.fromBytes(new Uint8Array(uncompressed));

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

  await rm(`${CHUNKS_DIR}/*`, { force: true });
}

console.log("Sorting chunks...");

for (let i = 0; i < chunks.length; i++) chunks[i].sort();

console.log("Saving chunks...");

for (let i = 0; i < chunks.length; i++) {
  const path = `${CHUNKS_DIR}/chunk-${i}.dat.lz4`;
  const chunk = chunks[i];
  const bytes = chunk.toBytes();
  const compressed = await compress(bytes);

  await Bun.write(path, compressed);
}

// const MAX_IDS = 100;
// const API_RATE = 10;

// const BYTES_PER_ID = 64 / 8;

// const regions = ["eu", "com", "asia"];
// const seeds = [5e8, 10e8, 20e8].map(BigInt);

// export interface QuickInfo {
//   status: string;
//   data: Record<string, {} | null>;
// }

// const ids: bigint[] = [];

// const t0 = performance.now();
// const maxT = 5 * 60 * 60 * 1000;
// const t1 = t0 + maxT;

// const unfilled = Array.from({ length: seeds.length });
// const offsets = unfilled.map(() => 0n);
// const queues = unfilled.map(() => [] as bigint[]);

// function mountIds() {
//   for (let i = 0; i < regions.length; i++) {
//     const queue = queues[i];

//     if (queue.length >= MAX_IDS) continue;

//     const availableSpace = MAX_IDS - queue.length;

//     const seed = seeds[i];
//     const offset = offsets[i]++;

//     for (let j = 0n; j < availableSpace; j++) {
//       const id = seed + offset + j;
//       queue.push(id);
//     }

//     offsets[i] += BigInt(availableSpace);
//   }
// }

// let i = 0;
// while (performance.now() < t1) {
//   mountIds();
//   await sleep();

//   const region = regions[i];
//   const queue = queues[i];

//   const accountIds = queue.join(",");
//   const fields = "account_id%2C-account_id";
//   const applicationId = import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID;

//   const url = `https://api.wotblitz.${
//     region
//   }/wotb/account/info/?application_id=${applicationId}&fields=${
//     fields
//   }&account_id=${accountIds}`;
//   const response = await fetch(url);
//   const data = (await response.json()) as QuickInfo;

//   if (data.status !== "ok") continue;

//   for (const key in data.data) {
//     const value = data.data[key];

//     if (value === null) continue;

//     const id = BigInt(key);

//     ids.push(id);
//   }

//   queues[i] = [];
//   i = (i + 1) % regions.length;
// }

// function sleep() {
//   return new Promise((resolve) => setTimeout(resolve, 1000 / API_RATE));
// }
