import type { ButtonProps } from "@radix-ui/themes";

export interface Tool {
  path?: string;
  strings?: string;

  button: ButtonProps["color"];
  href?: string;
}

export const tools: Record<string, Tool> = {
  tanks: {
    strings: "tankopedia",
    button: "purple",
  },
  compare: {
    button: "crimson",
  },
  performance: {
    button: "jade",
  },
  playlist: {
    button: "tomato",
  },
  mixer: {
    button: "gray",
  },
  guess: {
    button: "cyan",
  },
  gallery: {
    button: "gold",
  },
  session: {
    button: "blue",
  },
  tier_list: {
    button: "orange",
  },
  embed: {
    button: "red",
  },
  more: {
    href: "https://discord.gg/nDt7AjGJQH",
    button: "plum",
  },
};
