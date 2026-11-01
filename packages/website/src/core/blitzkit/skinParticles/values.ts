import type { ParticleValue } from "@blitzkit/core";
import { times } from "lodash-es";

function curveAverage(keys: number[][]) {
  let area = keys[0][1] * keys[0][2];

  for (let index = 1; index < keys.length; index++) {
    const [, value, time] = keys[index];
    const [, previousValue, previousTime] = keys[index - 1];

    area += ((value + previousValue) / 2) * (time - previousTime);
  }

  const [, value, time] = keys.at(-1)!;

  return area + value * Math.max(0, 1 - time);
}

export function isCurve(value: ParticleValue): value is [2, ...number[][][]] {
  return Array.isArray(value) && Array.isArray(value[1]);
}

/** one value per channel, averaged over what a curve spans */
export function average(value: ParticleValue) {
  if (typeof value === "number") return [value];
  if (!isCurve(value)) return value as number[];

  return (value.slice(1) as number[][][]).map(curveAverage);
}

export function averageColor(value: ParticleValue | undefined) {
  if (value === undefined) return [1, 1, 1, 1];

  if (typeof value === "number") {
    return times(4, (index) => ((value >>> ((3 - index) * 8)) & 0xff) / 255);
  }

  return average(value);
}

export function isVarying(value: ParticleValue | undefined) {
  return value !== undefined && average(value).some((speed) => speed !== 0);
}

export function isBound(value: unknown) {
  return Array.isArray(value) && typeof value[1] === "string";
}
