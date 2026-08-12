import { GitObjectStorage } from "../core/blitzkit/gitObjectStorage";
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
  await sleep();
}

// storage.commit();
