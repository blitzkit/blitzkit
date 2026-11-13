export enum ParticleBlending {
  Normal,
  Additive,
  AlphaAdditive,
}

/**
 * [time, value, hold] keys over a particle's life, time from 0 to 1; a held
 * key keeps its value until the next one
 */
export type ParticleKeys = number[][];

export enum ParticleForceType {
  Drag,
  Gravity,
  Wind,
}

export interface ParticleForceExtras {
  type: ParticleForceType;
  /** per axis for drag */
  strength: number[];
  direction: number[];
}

/** what a layer of a particle emitter needs at runtime */
export interface ParticleLayerExtras {
  sprite: string;
  blending: ParticleBlending;
  billboard: boolean;
  /** the axes each emitter-facing quad spans, besides the billboard */
  facings: number[][][];
  /** a lone particle that respawns as it dies */
  single: boolean;
  /** particles follow the emitter, or stay where they were let go */
  inherit: boolean;
  forces: ParticleForceExtras[];
  /** fades quads as they turn edge on */
  fresnel?: { bias: number; power: number };
  number: number;
  numberVariation: number;
  life: number;
  lifeVariation: number;
  velocity: number;
  velocityVariation: number;
  size: number[];
  sizeVariation: number[];
  sizeOverLife?: ParticleKeys[];
  alphaOverLife?: ParticleKeys;
  colorOverLife?: ParticleKeys[];
  color: number[];
  /** degrees about each axis, billboards only turn about z */
  angle: number[];
  angleVariation: number[];
  spin: number[];
  spinVariation: number[];
  pivot: number[];
  lods: boolean[];
}

/** where an emitter spawns its particles, by the game's emitter types */
export enum ParticleShape {
  Point,
  Rect,
  Disc,
  Circle,
  Sphere,
}

export interface ParticleEmitterExtras {
  position: number[];
  rotation: number[];
  scale: number[];
  direction: number[];
  range: number;
  shape: ParticleShape;
  radius: number;
  /** a rect's extent */
  size: number[];
  layers: ParticleLayerExtras[];
}

/** kept on the node a particle effect plays from */
export interface ParticleEffectExtras {
  delay: number;
  /** seconds it spawns for after the delay, forever when missing */
  duration?: number;
  lodDistances?: number[];
  emitters: ParticleEmitterExtras[];
}
