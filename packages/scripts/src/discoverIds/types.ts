export type IdsManifest = IdsManifestV1;

interface IdsManifestV1 {
  version: 1;
  last_verified: number;
  chunks: number;
  total_count: number;
}

export interface RegionDescriptor {
  domain: string;
  seed: number;
  max: number;
  dry_streak: number;
}

export interface QuickInfo {
  status: string;
  data: Record<string, {} | null>;
}
