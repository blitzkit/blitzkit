import { type Region } from './regions';

export const MIN_REGION_IDS: Record<Region, number> = {
  asia: 20e8,
  com: 10e8,
  eu: 5e8,
};

export const MAX_REGION_IDS: Record<Region, number> = {
  asia: 31e8 - 1,
  com: MIN_REGION_IDS.asia - 1,
  eu: MIN_REGION_IDS.com - 1,
};

export function idToRegion(id: number): Region {
  if (id >= 42e8) {
    throw new Error('bot id');
  } else if (id >= 31e8) {
    throw new Error('china id');
  } else if (id >= 20e8) {
    return 'asia';
  } else if (id >= 10e8) {
    return 'com';
  } else if (id >= 5e8) {
    return 'eu';
  } else if (id >= 0) {
    throw new Error('ru id');
  } else {
    throw new Error(`id ${id} is out of range`);
  }
}
