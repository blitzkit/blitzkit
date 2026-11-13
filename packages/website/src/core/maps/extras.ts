export type MapMaterialKind =
  | "object"
  | "speedTree"
  | "sky"
  | "water"
  | "terrain"
  | "grass"
  | "border"
  | "collision";

export interface MapMaterialExtras {
  kind: MapMaterialKind;
  lightmap?: boolean;
  lightmapTransform?: boolean;
  detailScale?: number[];
  flow?: { speed: number; offset: number };
  alphaTest?: number;
  alphaStep?: number;
  alphaBlend?: boolean;
  depthWrite?: boolean;
  shadowReceiver?: boolean;
  blendByAngle?: { bounds: number[]; power: number; inversion: number };
  flatColor?: number[];
  flatAlbedo?: number[];
  textureShift?: number[];
  textureShiftPerSecond?: number[];
  doubleSided?: boolean;
  poster?: boolean;
  renderObject?: boolean;
  normal0Scale?: number;
  normal1Scale?: number;
  normal0ShiftPerSecond?: number[];
  normal1ShiftPerSecond?: number[];
  texCoordTransform?: number[];
  tangent?: number[];
  fresnelBias?: number;
  fresnelPower?: number;
  reflectionTint?: number[];
  reflectionDistortion?: number;
  distortionFallSquareDist?: number;
  refractionDistortion?: number;
  refractionTint?: number[];
  shadowTint?: number[];
  specular?: { glossiness: number; specularity: number };
  textureTiling?: number[];
  separateLightmap?: boolean;
  tileColors?: number[][];
  tileScales?: number[];
  heightBlend?: {
    scale: number[];
    offset: number[];
    softness: number[];
    weight: number;
  };
  baseColorMultiplier?: number;
  visibilityDistance?: number;
  mapBounds?: number[];
}

export type TextureSlot =
  | "baseColor"
  | "occlusion"
  | "emissive"
  | "normal"
  | "metallicRoughness"
  | "clearcoat";

export const TEXTURE_SLOTS = {
  albedo: "baseColor",
  lightmap: "occlusion",
  detail: "emissive",
  flowmap: "metallicRoughness",
  waterNormal: "normal",
  grassColor: "occlusion",
  grassDensity: "emissive",
  terrainColor: "baseColor",
  terrainMask: "emissive",
  terrainMaskAuxiliary: "normal",
  terrainTiles: "occlusion",
  terrainTilesAuxiliary: "metallicRoughness",
  terrainTileHeights: "clearcoat",
} satisfies Record<string, TextureSlot>;

export type TextureRole = keyof typeof TEXTURE_SLOTS;

export interface MapAnimationInfo {
  clip: string;
  duration: number;
  delay: number;
  delayVariation: number;
  repeats: number | null;
  speed: number;
  rewind?: boolean;
  absolute?: boolean;
  group?: string;
}

export interface MapVisibility {
  initial: boolean;
  changes: [time: number, visible: boolean][];
}

export interface MapWind {
  leafAmplitude: number;
  leafSpeed: number;
  trunkAmplitude: number;
  trunkSpring: number;
  trunkDamping: number;
}

export interface MapSceneExtras {
  mapBounds?: number[];
  sunDirection?: number[];
  shadowColor?: number[];
  playableBounds?: number[];
}
