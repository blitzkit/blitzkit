import {
  HEIGHTMAP_MAX,
  HeightmapReadStream,
  heightmapSample,
} from "@blitzkit/core";
import { times } from "lodash-es";
import sharp from "sharp";
import { vfs } from "../../blitzkit/vfs";
import type { MapMaterialExtras, MapSceneExtras } from "../extras";
import {
  addExtras,
  createAccessor,
  type DataNode,
  type MapContext,
} from "./context";
import { effectiveMaterial, readFloat, readFloats } from "./materials";
import {
  losslessTexture,
  readMapTexture,
  setTextureSlot,
  type RawTexture,
} from "./textures";

const DEFAULT_SUN_DIRECTION = [0.5, 0.5, 0.707];
const MIN_SUN_ELEVATION = (10 * Math.PI) / 180;
const MAX_SUN_ELEVATION = (70 * Math.PI) / 180;
const FALLBACK_SUN_ELEVATION = Math.PI / 4;
const ALPHA_SAMPLE_STRIDE = 97;

export async function loadHeightmap(
  { directory }: MapContext,
  renderObject: Record<string, any>,
) {
  const file = await vfs.file(`Data/3d/${directory}/${renderObject.hmap}`);
  const heightmap = new HeightmapReadStream(
    file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ) as ArrayBuffer,
  ).heightmap();
  const { size } = heightmap;
  const bounds = Array.from(new Float32Array(renderObject.bbox));
  const [minX, minY, minZ, maxX, maxY, maxZ] = bounds;

  function heightAt(column: number, row: number) {
    return (
      minZ +
      (heightmapSample(heightmap, column, row) / HEIGHTMAP_MAX) * (maxZ - minZ)
    );
  }

  function heightAtPosition(x: number, y: number) {
    const column = ((x - minX) / (maxX - minX)) * (size - 1);
    const row = ((y - minY) / (maxY - minY)) * (size - 1);
    const column0 = Math.max(0, Math.min(size - 2, Math.floor(column)));
    const row0 = Math.max(0, Math.min(size - 2, Math.floor(row)));
    const fractionX = column - column0;
    const fractionY = row - row0;
    const top =
      heightAt(column0, row0) * (1 - fractionX) +
      heightAt(column0 + 1, row0) * fractionX;
    const bottom =
      heightAt(column0, row0 + 1) * (1 - fractionX) +
      heightAt(column0 + 1, row0 + 1) * fractionX;

    return top * (1 - fractionY) + bottom * fractionY;
  }

  return { size, bounds, heightAt, heightAtPosition };
}

function fitSunDirection(
  size: number,
  bounds: number[],
  heightAt: (column: number, row: number) => number,
  lightAt: (u: number, v: number) => number,
) {
  const [minX, minY, , maxX, maxY] = bounds;
  const stepX = (maxX - minX) / (size - 1);
  const stepY = (maxY - minY) / (size - 1);
  const terms = 4;
  const normal = times(terms, () => new Float64Array(terms));
  const right = new Float64Array(terms);

  for (let row = 2; row < size - 2; row += 2) {
    for (let column = 2; column < size - 2; column += 2) {
      const slopeX =
        (heightAt(column + 1, row) - heightAt(column - 1, row)) / (2 * stepX);
      const slopeY =
        (heightAt(column, row + 1) - heightAt(column, row - 1)) / (2 * stepY);
      const length = Math.hypot(slopeX, slopeY, 1);
      const normalX = -slopeX / length;
      const normalY = -slopeY / length;

      if (normalX ** 2 + normalY ** 2 < 0.01) continue;

      const light = lightAt(column / (size - 1), 1 - row / (size - 1));
      const sample = [1, normalX, normalY, normalX ** 2 + normalY ** 2];

      for (let i = 0; i < terms; i++) {
        right[i] += sample[i] * light;

        for (let j = 0; j < terms; j++) normal[i][j] += sample[i] * sample[j];
      }
    }
  }

  const matrix = normal.map((row, index) => [...row, right[index]]);

  for (let pivot = 0; pivot < terms; pivot++) {
    let best = pivot;

    for (let row = pivot + 1; row < terms; row++) {
      if (Math.abs(matrix[row][pivot]) > Math.abs(matrix[best][pivot])) {
        best = row;
      }
    }

    [matrix[pivot], matrix[best]] = [matrix[best], matrix[pivot]];

    if (Math.abs(matrix[pivot][pivot]) < 1e-9) return DEFAULT_SUN_DIRECTION;

    for (let row = 0; row < terms; row++) {
      if (row === pivot) continue;

      const factor = matrix[row][pivot] / matrix[pivot][pivot];

      for (let column = pivot; column <= terms; column++) {
        matrix[row][column] -= factor * matrix[pivot][column];
      }
    }
  }

  const [, horizontalX, horizontalY, curvature] = times(
    terms,
    (index) => matrix[index][terms] / matrix[index][index],
  );
  const horizontal = Math.hypot(horizontalX, horizontalY);

  if (horizontal < 1e-6) return DEFAULT_SUN_DIRECTION;

  const fittedElevation = Math.atan2(-2 * curvature, horizontal);
  const elevation =
    fittedElevation < MIN_SUN_ELEVATION || fittedElevation > MAX_SUN_ELEVATION
      ? FALLBACK_SUN_ELEVATION
      : fittedElevation;

  return [
    (horizontalX / horizontal) * Math.cos(elevation),
    (horizontalY / horizontal) * Math.cos(elevation),
    Math.sin(elevation),
  ];
}

function resizedChannel(
  image: RawTexture,
  channel: 0 | 1 | 2 | 3,
  width: number,
  height: number,
) {
  return image.channels > channel
    ? sharp(image.data, { raw: image })
        .extractChannel(channel)
        .resize(width, height)
        .raw()
        .toBuffer()
    : Promise.resolve(Buffer.alloc(width * height, 255));
}

function rgb(image: RawTexture) {
  return sharp(image.data, { raw: image }).removeAlpha();
}

function interleave(width: number, height: number, channels: Buffer[]) {
  const pixels = Buffer.alloc(width * height * 3);

  for (let index = 0; index < width * height; index++) {
    channels.forEach((channel, offset) => {
      pixels[index * 3 + offset] = channel[index];
    });
  }

  return sharp(pixels, { raw: { width, height, channels: 3 } });
}

function lightmapReader(color: RawTexture, separateLightmap: boolean) {
  let alphaMin = 255;
  let alphaMax = 0;

  if (color.channels === 4) {
    for (
      let index = 3;
      index < color.data.length;
      index += 4 * ALPHA_SAMPLE_STRIDE
    ) {
      alphaMin = Math.min(alphaMin, color.data[index]);
      alphaMax = Math.max(alphaMax, color.data[index]);
    }
  }

  const lightInAlpha = separateLightmap && alphaMax > alphaMin;

  return (u: number, v: number) => {
    const x = Math.min(color.width - 1, Math.floor(u * color.width));
    const y = Math.min(color.height - 1, Math.floor(v * color.height));
    const index = (y * color.width + x) * color.channels;

    return lightInAlpha
      ? color.data[index + 3] / 255
      : (color.data[index] + color.data[index + 1] + color.data[index + 2]) /
          765;
  };
}

export function findLandscapeNode(
  materialNodes: Map<bigint, DataNode>,
  texture: string,
) {
  return [...materialNodes.values()].find(
    (node) =>
      node.textures?.[texture] ?? node.configArchive_0?.textures?.[texture],
  );
}

export async function createTerrain(
  context: MapContext,
  materialNodes: Map<bigint, DataNode>,
  renderObject: Record<string, any>,
) {
  const { document, scene } = context;
  const { size, bounds, heightAt } = await loadHeightmap(context, renderObject);

  addExtras(scene, { mapBounds: bounds } satisfies MapSceneExtras);

  const [minX, minY, , maxX, maxY] = bounds;
  const positions = new Float32Array(size ** 2 * 3);
  const uvs = new Float32Array(size ** 2 * 2);
  const indices = new Uint32Array((size - 1) ** 2 * 6);

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const u = column / (size - 1);
      const v = row / (size - 1);
      const index = row * size + column;

      positions[index * 3] = minX + u * (maxX - minX);
      positions[index * 3 + 1] = minY + v * (maxY - minY);
      positions[index * 3 + 2] = heightAt(column, row);
      uvs[index * 2] = u;
      uvs[index * 2 + 1] = 1 - v;
    }
  }

  let offset = 0;

  for (let row = 0; row < size - 1; row++) {
    for (let column = 0; column < size - 1; column++) {
      const a = row * size + column;
      const b = a + 1;
      const c = a + size;
      const d = c + 1;

      indices.set([a, b, d, a, d, c], offset);
      offset += 6;
    }
  }

  const landscapeNode = findLandscapeNode(materialNodes, "colorTexture");
  const material = document.createMaterial("terrain");

  if (landscapeNode) {
    const landscape = effectiveMaterial(landscapeNode, materialNodes);
    const {
      colorTexture,
      tileMask,
      tileTexture0,
      tileMaskHeightBlend,
      tileHeightTexture,
    } = landscape.textures;
    const { flags, properties } = landscape;
    const textureTiling = readFloats(properties.textureTiling, 2) ?? [50, 50];
    const separateLightmap = flags.LANDSCAPE_SEPARATE_LIGHTMAP_CHANNEL === 1;
    const heightBlend =
      flags.LANDSCAPE_HEIGHT_BLEND === 1 &&
      typeof tileMaskHeightBlend === "string" &&
      typeof tileHeightTexture === "string";
    const scaledTiles =
      heightBlend && flags.LANDSCAPE_SCALED_TILES_NON_PBR === 1;
    const [color, mask, tiles, tileHeights] = await Promise.all([
      readMapTexture(context, colorTexture),
      readMapTexture(context, heightBlend ? tileMaskHeightBlend : tileMask),
      readMapTexture(context, tileTexture0),
      heightBlend ? readMapTexture(context, tileHeightTexture) : null,
    ]);

    addExtras(scene, {
      sunDirection: fitSunDirection(
        size,
        bounds,
        heightAt,
        lightmapReader(color, separateLightmap),
      ),
    } satisfies MapSceneExtras);

    const [colorAlpha, maskAlpha, tilesAlpha, heightAlpha] = await Promise.all([
      resizedChannel(color, 3, mask.width, mask.height),
      resizedChannel(mask, 3, mask.width, mask.height),
      resizedChannel(tiles, 3, tiles.width, tiles.height),
      tileHeights
        ? resizedChannel(tileHeights, 3, tiles.width, tiles.height)
        : Promise.resolve(Buffer.alloc(tiles.width * tiles.height)),
    ]);
    const [
      colorTextureOut,
      maskTexture,
      maskAuxiliaryTexture,
      tilesTexture,
      tilesAuxiliaryTexture,
      heightTexture,
    ] = await Promise.all([
      losslessTexture(context, "terrainColor", rgb(color)),
      losslessTexture(context, "terrainMask", rgb(mask)),
      losslessTexture(
        context,
        "terrainMaskAuxiliary",
        interleave(mask.width, mask.height, [maskAlpha, colorAlpha]),
      ),
      losslessTexture(context, "terrainTiles", rgb(tiles)),
      losslessTexture(
        context,
        "terrainTilesAuxiliary",
        interleave(tiles.width, tiles.height, [tilesAlpha, heightAlpha]),
      ),
      tileHeights
        ? losslessTexture(
            context,
            "terrainTileHeights",
            rgb(tileHeights).resize(tiles.width, tiles.height),
          )
        : null,
    ]);

    setTextureSlot(document, material, "terrainColor", colorTextureOut);
    setTextureSlot(document, material, "terrainMask", maskTexture);
    setTextureSlot(
      document,
      material,
      "terrainMaskAuxiliary",
      maskAuxiliaryTexture,
    );
    setTextureSlot(document, material, "terrainTiles", tilesTexture);
    setTextureSlot(
      document,
      material,
      "terrainTilesAuxiliary",
      tilesAuxiliaryTexture,
    );
    material.setExtras({
      kind: "terrain",
      textureTiling,
      separateLightmap,
      shadowReceiver: true,
      tileColors: times(
        4,
        (index) => readFloats(properties[`tileColor${index}`], 3) ?? [1, 1, 1],
      ),
      tileScales: scaledTiles
        ? times(4, (index) => readFloat(properties[`tileScale${index}`], 1))
        : undefined,
      heightBlend: heightTexture
        ? {
            scale: readFloats(properties.heightMapScaleColor, 4) ?? [
              1, 1, 1, 1,
            ],
            offset: readFloats(properties.heightMapOffsetColor, 4) ?? [
              0, 0, 0, 0,
            ],
            softness: readFloats(properties.heightMapSoftnessColor, 4) ?? [
              0, 0, 0, 0,
            ],
            weight: readFloat(properties.tilemaskWeight, 0.15),
          }
        : undefined,
    } satisfies MapMaterialExtras);

    if (heightTexture) {
      setTextureSlot(document, material, "terrainTileHeights", heightTexture);
    }
  }

  const primitive = document
    .createPrimitive()
    .setMaterial(material)
    .setIndices(createAccessor(context, "SCALAR", indices))
    .setAttribute("POSITION", createAccessor(context, "VEC3", positions))
    .setAttribute("TEXCOORD_0", createAccessor(context, "VEC2", uvs));

  return document
    .createNode("terrain")
    .setMesh(document.createMesh("terrain").addPrimitive(primitive));
}
