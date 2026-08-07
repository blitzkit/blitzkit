const MAX_IDS = 100;
const API_RATE = 10;

const ACCOMMODATED_ID_COUNT = 10_000_000_000;
const BYTES_PER_ID = 64 / 8;
const MAX_BYTES_PER_BATCH = 100 * 1_000_000;

const regions = ["eu", "com", "asia"];
const seeds = [5e8, 10e8, 20e8].map(BigInt);

export interface QuickInfo {
  status: string;
  data: Record<string, {} | null>;
}

const batches = BigInt(
  Math.ceil((ACCOMMODATED_ID_COUNT * BYTES_PER_ID) / MAX_BYTES_PER_BATCH),
);
const ids: bigint[] = [];

const t0 = performance.now();
const maxT = 5 * 60 * 60 * 1000;
const t1 = t0 + maxT;

const unfilled = Array.from({ length: seeds.length });
const offsets = unfilled.map(() => 0n);
const queues = unfilled.map(() => [] as bigint[]);

function mountIds() {
  for (let i = 0; i < regions.length; i++) {
    const queue = queues[i];

    if (queue.length >= MAX_IDS) continue;

    const availableSpace = MAX_IDS - queue.length;

    const seed = seeds[i];
    const offset = offsets[i]++;

    for (let j = 0n; j < availableSpace; j++) {
      const id = seed + offset + j;
      queue.push(id);
    }

    offsets[i] += BigInt(availableSpace);
  }
}

let i = 0;
while (performance.now() < t1) {
  mountIds();
  await sleep();

  const region = regions[i];
  const queue = queues[i];

  const accountIds = queue.join(",");
  const fields = "account_id%2C-account_id";
  const applicationId = import.meta.env.PUBLIC_WARGAMING_APPLICATION_ID;

  const url = `https://api.wotblitz.${
    region
  }/wotb/account/info/?application_id=${applicationId}&fields=${
    fields
  }&account_id=${accountIds}`;
  const response = await fetch(url);
  const data = (await response.json()) as QuickInfo;

  if (data.status !== "ok") continue;

  for (const key in data.data) {
    const value = data.data[key];

    if (value === null) continue;

    const id = BigInt(key);

    ids.push(id);
  }

  queues[i] = [];
  i = (i + 1) % regions.length;
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 1000 / API_RATE));
}
