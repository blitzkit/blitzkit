// in rem
export const spaces = [
  2 ** -4,
  2 ** -3,
  2 ** -2,
  2 ** -1,
  2 ** 0,
  2 ** 1,
  2 ** 2,
  2 ** 3,
  2 ** 4,
  2 ** 5,
] as const;

export const weights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900,
} as const;

export const COLOR_SCALE_LENGTH = 12;

export const COLORS_ALPHA_ONLY = ["black", "white"] as const;
export type AlphaOnlyColor = (typeof COLORS_ALPHA_ONLY)[number];

export const COLOR_ALIASES = ["gray", "accent"] as const;
export type ColorAlias = (typeof COLOR_ALIASES)[number];
