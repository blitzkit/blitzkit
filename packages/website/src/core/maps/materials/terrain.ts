import {
  RepeatWrapping,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  type MeshStandardMaterial,
} from "three";
import type { MapMaterialExtras } from "../extras";
import { slotTexture } from "./common";
import {
  shadowFragment,
  shadowFragmentPars,
  shadowUniforms,
  shadowVertex,
  shadowVertexPars,
} from "./shadow";

export function createTerrainMaterial(
  source: MeshStandardMaterial,
  extras: MapMaterialExtras,
) {
  const [tilingX, tilingY] = extras.textureTiling ?? [50, 50];
  const tiles = slotTexture(source, "terrainTiles")!;
  const tilesAuxiliary = slotTexture(source, "terrainTilesAuxiliary")!;
  const tileHeights = extras.heightBlend
    ? slotTexture(source, "terrainTileHeights")
    : null;
  const tileColors = extras.tileColors ?? [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];
  const heightBlend = extras.heightBlend ?? {
    scale: [1, 1, 1, 1],
    offset: [0, 0, 0, 0],
    softness: [0, 0, 0, 0],
    weight: 0.15,
  };

  for (const texture of [tiles, tilesAuxiliary, tileHeights]) {
    if (!texture) continue;

    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  }

  const receiveShadow = !!extras.shadowReceiver;

  return new ShaderMaterial({
    lights: receiveShadow,
    defines: {
      ...(extras.separateLightmap && { SEPARATE_LIGHTMAP: "" }),
      ...(receiveShadow && { RECEIVE_SHADOW: "" }),
      ...(extras.tileScales && { SCALED_TILES: "" }),
      ...(tileHeights && { HEIGHT_BLEND: "" }),
    },
    uniforms: {
      ...shadowUniforms(receiveShadow),
      colorTexture: { value: slotTexture(source, "terrainColor") },
      tileMask: { value: slotTexture(source, "terrainMask") },
      maskAuxiliary: { value: slotTexture(source, "terrainMaskAuxiliary") },
      tileTexture: { value: tiles },
      tileTextureAuxiliary: { value: tilesAuxiliary },
      tileHeights: { value: tileHeights },
      textureTiling: { value: new Vector2(tilingX, tilingY) },
      tileScales: {
        value: new Vector4(...(extras.tileScales ?? [1, 1, 1, 1])),
      },
      tileColor0: { value: new Vector3(...tileColors[0]) },
      tileColor1: { value: new Vector3(...tileColors[1]) },
      tileColor2: { value: new Vector3(...tileColors[2]) },
      tileColor3: { value: new Vector3(...tileColors[3]) },
      heightMapScale: { value: new Vector4(...heightBlend.scale) },
      heightMapOffset: { value: new Vector4(...heightBlend.offset) },
      heightMapSoftness: { value: new Vector4(...heightBlend.softness) },
      tilemaskWeight: { value: heightBlend.weight },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      ${shadowVertexPars}

      void main() {
        vUv = uv;

        ${shadowVertex("position", "vec3(0.0, 0.0, 1.0)")}

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D colorTexture;
      uniform sampler2D tileMask;
      uniform sampler2D maskAuxiliary;
      uniform sampler2D tileTexture;
      uniform sampler2D tileTextureAuxiliary;
      uniform sampler2D tileHeights;
      uniform vec2 textureTiling;
      uniform vec4 tileScales;
      uniform vec3 tileColor0;
      uniform vec3 tileColor1;
      uniform vec3 tileColor2;
      uniform vec3 tileColor3;
      uniform vec4 heightMapScale;
      uniform vec4 heightMapOffset;
      uniform vec4 heightMapSoftness;
      uniform float tilemaskWeight;
      varying vec2 vUv;
      ${shadowFragmentPars}

      void main() {
        vec2 tiledUv = vUv * textureTiling;
        vec3 aux = texture2D(maskAuxiliary, vUv).rgb;
        vec3 colorMap = texture2D(colorTexture, vUv).rgb;
        vec4 mask = vec4(texture2D(tileMask, vUv).rgb, aux.r);

        #ifdef SCALED_TILES
          vec2 tiledUv0 = tiledUv * tileScales.x;
          vec2 tiledUv1 = tiledUv * tileScales.y;
          vec2 tiledUv2 = tiledUv * tileScales.z;
          vec2 tiledUv3 = tiledUv * tileScales.w;
        #else
          vec2 tiledUv0 = tiledUv;
          vec2 tiledUv1 = tiledUv;
          vec2 tiledUv2 = tiledUv;
          vec2 tiledUv3 = tiledUv;
        #endif

        vec4 tile = vec4(
          texture2D(tileTexture, tiledUv0).r,
          texture2D(tileTexture, tiledUv1).g,
          texture2D(tileTexture, tiledUv2).b,
          texture2D(tileTextureAuxiliary, tiledUv3).r
        );

        #ifdef SEPARATE_LIGHTMAP
          colorMap *= aux.g;
        #endif

        #ifdef HEIGHT_BLEND
          vec4 heights = vec4(
            texture2D(tileHeights, tiledUv0).r,
            texture2D(tileHeights, tiledUv1).g,
            texture2D(tileHeights, tiledUv2).b,
            texture2D(tileTextureAuxiliary, tiledUv3).g
          );
          vec4 blendHeights = clamp(
            tilemaskWeight * (mask * 2.0 - 1.0) + heights * heightMapScale + heightMapOffset,
            0.0,
            1.0
          );
          vec4 heightStart =
            max(max(blendHeights.x, blendHeights.y), max(blendHeights.z, blendHeights.w)) -
            heightMapSoftness;
          vec4 weights = max(blendHeights - heightStart, 0.001);
          vec3 tiled = (
            tile.x * tileColor0 * weights.x +
            tile.y * tileColor1 * weights.y +
            tile.z * tileColor2 * weights.z +
            tile.w * tileColor3 * weights.w
          ) / (weights.x + weights.y + weights.z + weights.w);
        #else
          vec3 tiled =
            tile.x * mask.x * tileColor0 +
            tile.y * mask.y * tileColor1 +
            tile.z * mask.z * tileColor2 +
            tile.w * mask.w * tileColor3;
        #endif

        vec4 color = vec4(tiled * colorMap * 2.0, 1.0);

        ${shadowFragment}

        gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), 1.0);
      }
    `,
  });
}
