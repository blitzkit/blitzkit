import {
  DidsReadStream,
  DidsWriteStream,
  MIN_REGION_IDS,
  REGIONS,
  Region,
  asset,
  idToRegion,
} from '@blitzkit/core';
import { retryAbleBlitzFetchEvent } from '@blitzkit/core/src/blitz/fetchBlitz';
import { getAccountInfo } from '@blitzkit/core/src/blitz/getAccountInfo';
import { chunk, times, uniq } from 'lodash';
import { compress, decompress } from 'lz4js';
import { DiscoveredIdsDefinitions } from '../../website/src/core/blitzkit/discoveredIdDefinitions';
import { commitAssets } from './core/github/commitAssets';

const CHUNK_SIZE = 2 ** 21;
const RUN_TIME = 1000 * 60 * 60 * 5.5;
const PROGRESS_UPDATE_FREQUENCY = 1000 * 60;
const MAX_REQUESTS = 10;
const ACCOUNTS_PER_CALL = 100;
const TERMINATION_THRESHOLD = 1000;
const startTime = Date.now();
const indexableRegions = [...REGIONS];
let ids: number[] = [];
const preDiscoveredManifest = (await fetch(asset('ids/manifest.json')).then(
  (response) => response.json(),
)) as DiscoveredIdsDefinitions;

console.log(
  `Fetching ${preDiscoveredManifest.chunks} pre-discovered chunks...`,
);

let chunkIndex = 0;
while (chunkIndex < preDiscoveredManifest.chunks) {
  const preDiscovered = await fetch(asset(`ids/${chunkIndex}.dids.lz4`)).then(
    async (response) => {
      const buffer = await response.arrayBuffer();
      const decompressed = decompress(new Uint8Array(buffer)).buffer;
      return new DidsReadStream(decompressed as ArrayBuffer).dids();
    },
  );

  // no spread syntax: https://github.com/oven-sh/bun/issues/11734
  ids = ids.concat(preDiscovered);

  console.log(
    `Pre-discovered ${preDiscovered.length} ids (chunk ${chunkIndex})`,
  );

  chunkIndex++;
}

const regionalIdIndex: Record<Region, number> = {
  asia: ids.findLast((id) => idToRegion(id) === 'asia') ?? MIN_REGION_IDS.asia,
  com: ids.findLast((id) => idToRegion(id) === 'com') ?? MIN_REGION_IDS.com,
  eu: ids.findLast((id) => idToRegion(id) === 'eu') ?? MIN_REGION_IDS.eu,
};
const zeroStreak: Record<Region, number> = { asia: 0, com: 0, eu: 0 };
let regionIndex = 0;
let outOfTimeFlagged = false;

async function verify(region: Region, ids: number[]) {
  const infos = await getAccountInfo(region, ids, undefined, {
    // cheeky way of requesting nothing
    fields: 'account_id,-account_id',
  });
  const filtered = ids.filter((_, index) => {
    const info = infos[index];
    return info !== null;
  });

  return filtered;
}

let discardAttempts = 0;
let lastProgressUpdate = 0;

retryAbleBlitzFetchEvent.on(() => discardAttempts++);

const interval = setInterval(async () => {
  if (discardAttempts > 0) return discardAttempts--;

  const region = indexableRegions[regionIndex];
  const idsToVerify = times(
    ACCOUNTS_PER_CALL,
    (index) => regionalIdIndex[region] + index,
  );
  const verified = await verify(region, idsToVerify);

  if (Date.now() - lastProgressUpdate > PROGRESS_UPDATE_FREQUENCY) {
    lastProgressUpdate = Date.now();
    console.log(`Discovered ${ids.length} ids in ${Date.now() - startTime}ms`);
  }

  if (verified.length === 0) {
    zeroStreak[region]++;

    if (zeroStreak[region] >= TERMINATION_THRESHOLD) {
      const sliceableIndex = indexableRegions.indexOf(region);

      if (sliceableIndex !== -1) {
        console.log(`Stopped discovery for ${region}`);
        indexableRegions.splice(sliceableIndex, 1);

        if (indexableRegions.length === 0) {
          console.log('All players discovered exhaustively!');
          post();
        }
      }
    }
  } else {
    zeroStreak[region] = 0;
    ids.push(...verified);
  }

  if (Date.now() - startTime > RUN_TIME && !outOfTimeFlagged) {
    outOfTimeFlagged = true;
    console.log('Out of time');
    post();
  }

  regionIndex = (regionIndex + 1) % indexableRegions.length;
  regionalIdIndex[region] += ACCOUNTS_PER_CALL;
}, 1000 / MAX_REQUESTS);

function post() {
  clearInterval(interval);
  ids = uniq(ids).sort((a, b) => a - b);
  console.log(`Uploading ${ids.length} ids...`);

  const idsChunked = chunk(ids, CHUNK_SIZE);
  const files = idsChunked.map((chunk, index) => {
    const didsWriteStream = new DidsWriteStream().dids(chunk);
    const buffer = didsWriteStream.uint8Array;
    const compressed = compress(buffer);

    console.log(
      `Chunk ${index} with ${chunk.length} ids (compressed: ${compressed.length}; uncompressed: ${buffer.length})`,
    );

    const content = Buffer.from(compressed).toString('base64');

    return {
      content,
      encoding: 'base64' as const,
      path: `ids/${index}.dids.lz4`,
    };
  });

  commitAssets('discovered ids', [
    ...files,
    {
      content: JSON.stringify({
        chunks: idsChunked.length,
        count: ids.length,
        time: Date.now(),
      } satisfies DiscoveredIdsDefinitions),
      encoding: 'utf-8',
      path: 'ids/manifest.json',
    },
  ]);
}
