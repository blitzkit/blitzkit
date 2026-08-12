import { GitObjectStorage } from "../core/blitzkit/gitObjectStorage";
import { IdArray } from "../core/blitzkit/idArray";
import { API_RATE } from "../discoverIds/constants";
import { sleep, withinTimeLimit } from "../discoverIds/time";
import { IdsManifest } from "../discoverIds/types";
import { IDS_API_BASE } from "./constants";
import { PerformanceManifest } from "./types";

const storage = await new GitObjectStorage(
  "blitzkit/data-performance",
  "../../temp/performance",
  import.meta.env.GH_TOKEN,
).init();

const manifest = await storage.json<PerformanceManifest>("manifest.json");
const idsManifest = await fetch(`${IDS_API_BASE}/manifest.json`).then(
  (response) => response.json() as Promise<IdsManifest>,
);

while (withinTimeLimit()) {
  manifest.last_updated = (manifest.last_updated + 1) % idsManifest.chunks;

  const url = `${IDS_API_BASE}/chunks/chunk-${manifest.last_updated}.dat.lz4`;

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const ids = IdArray.fromCompressed(bytes);
  const size = ids.size();

  console.log(
    `Chunk ${manifest.last_updated} contains ${size} ids, estimated to take ${(size / API_RATE / 60).toFixed(0)}min`,
  );

  for (let i = 0; i < size; i++) {
    await sleep();
  }
}

// storage.commit();
