import { asset } from './asset';

export interface DiscoveredIdsDefinitions {
  time: number;
  chunks: number;
  count: number;
}

export async function fetchDiscoveredIdsDefinitions() {
  const response = await fetch(asset('ids/manifest.json'));
  return response.json() as Promise<DiscoveredIdsDefinitions>;
}
