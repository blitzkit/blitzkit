import * as colors from "@radix-ui/colors";
import { Theme } from "@radix-ui/themes";
import type { ComponentProps } from "react";

export type AccentColor = Exclude<
  ComponentProps<typeof Theme>["accentColor"],
  "gray" | undefined
>;
export type AccentColorDark = `${AccentColor}Dark`;
export type GrayColor = Exclude<
  ComponentProps<typeof Theme>["grayColor"],
  "auto" | undefined
>;
export type GrayColorDark = `${GrayColor}Dark`;

export const ACCENT_COLORS: AccentColor[] = [
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "brown",
  "orange",
  "sky",
  "mint",
  "lime",
  "yellow",
  "amber",
  "gold",
  "bronze",
];
export const GRAY_COLORS: GrayColor[] = [
  "gray",
  "mauve",
  "slate",
  "sage",
  "olive",
  "sand",
];

export const PALETTES: Record<
  AccentColor | AccentColorDark | GrayColor | GrayColorDark,
  { [key: `${string}${number}`]: string }
> = colors;
