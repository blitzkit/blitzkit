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
