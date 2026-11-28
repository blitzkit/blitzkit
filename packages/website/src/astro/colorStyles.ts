import * as colors from "@radix-ui/colors";
import { range } from "lodash-es";
import {
  COLORS_ALPHA_ONLY,
  COLOR_SCALE_LENGTH,
  type AlphaOnlyColor,
  type ColorAlias,
} from "../config/styles";
import type { Color } from "../ui/color";

type RadixScale = Record<string, string>;

const SOLID_STEPS = range(1, COLOR_SCALE_LENGTH + 1).map(String);
const ALPHA_STEPS = SOLID_STEPS.map((step) => `a${step}`);
const ALL_STEPS = [...SOLID_STEPS, ...ALPHA_STEPS];

function isAlphaOnly(color: string) {
  return COLORS_ALPHA_ONLY.includes(color as AlphaOnlyColor);
}

// Only names with a dark scale, which also drops module keys like default and __esModule
export const COLORS = Object.keys(colors).filter(
  (name) => `${name}Dark` in colors && !isAlphaOnly(name),
) as Color[];

// Black and white have no solid scale, so spreading them adds nothing
function scale(name: string) {
  return colors[name as keyof typeof colors] as RadixScale | undefined;
}

function variables(
  name: string,
  steps: string[],
  value: (step: string) => string,
) {
  return steps.map((step) => `--${name}-${step}:${value(step)};`).join("");
}

function reference(name: string) {
  return (step: string) => `var(--${name}-${step})`;
}

export function colorScaleStyles(color: Color | AlphaOnlyColor) {
  const steps = isAlphaOnly(color) ? ALPHA_STEPS : ALL_STEPS;
  const light = { ...scale(color), ...scale(`${color}A`) };
  const dark = isAlphaOnly(color)
    ? light
    : { ...scale(`${color}Dark`), ...scale(`${color}DarkA`) };

  // Radix keys are the color then the step, like blue1 or blueA1
  function radix(theme: RadixScale) {
    return (step: string) => theme[`${color}${step.toUpperCase()}`];
  }

  const accent = variables("accent", steps, reference(color));

  return [
    `:root.dark{${variables(color, steps, radix(dark))}}`,
    `:root.light{${variables(color, steps, radix(light))}}`,
    `*[data-accent="${color}"]{${accent}}`,
  ].join("");
}

export function colorAliasStyles(color: Color, alias: ColorAlias) {
  const accent = variables("accent", ALL_STEPS, reference(alias));

  return [
    `:root{${variables(alias, ALL_STEPS, reference(color))}}`,
    `*[data-accent="${alias}"]{${accent}}`,
  ].join("");
}
