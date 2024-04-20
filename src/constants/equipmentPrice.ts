import { Vector3Tuple } from 'three';
import { Tier } from '../core/blitzrinth/tankDefinitions';

export const equipmentPriceMatrix: Record<Tier, Vector3Tuple> = {
  1: [100, 200, 300],
  2: [200, 300, 400],
  3: [400, 500, 600],
  4: [4000, 5000, 6000],
  5: [40_000, 50_000, 60_000],
  6: [100_000, 120_000, 140_000],
  7: [150_000, 170_000, 190_000],
  8: [200_000, 225_000, 250_000],
  9: [250_000, 275_000, 300_000],
  10: [300_000, 350_000, 400_000],
};
