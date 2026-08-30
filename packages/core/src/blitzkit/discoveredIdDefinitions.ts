import { staticAsset } from "@blitzkit/core";

export interface DiscoveredIdsDefinitions {
  time: number;
  chunks: number;
  count: number;
}

export async function fetchDiscoveredIds() {
  const response = await fetch(staticAsset("ids/manifest.json"));
  return response.json() as Promise<DiscoveredIdsDefinitions>;
}
