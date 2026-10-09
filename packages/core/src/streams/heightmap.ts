import { times } from 'lodash-es';
import { ReadStream } from './buffer';

export const HEIGHTMAP_MAX = 0xffff;

export interface Heightmap {
  size: number;
  tileSize: number;
  samples: number[];
}

export class HeightmapReadStream extends ReadStream {
  heightmap(): Heightmap {
    const size = this.uint32();
    const tileSize = this.uint32();
    const samples = times(size ** 2, () => this.uint16());

    return { size, tileSize, samples };
  }
}

export function heightmapSample(
  { size, tileSize, samples }: Heightmap,
  column: number,
  row: number,
) {
  const tilesPerRow = size / tileSize;
  const tile =
    Math.floor(row / tileSize) * tilesPerRow + Math.floor(column / tileSize);

  return samples[
    tile * tileSize ** 2 + (row % tileSize) * tileSize + (column % tileSize)
  ];
}
