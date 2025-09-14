import type { ButtonProps } from "@radix-ui/themes";

export interface Tool {
  id: string;
  strings?: string;

  button: ButtonProps["color"];
  significant?: boolean;
  disabled?: boolean;
  href?: string;
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",
    strings: "tankopedia",
    button: "purple",
    significant: true,
  },
  players: {
    id: "players",
    disabled: true,
    button: "blue",
  },
  compare: {
    id: "compare",
    button: "crimson",
  },
  performance: {
    id: "performance",
    button: "jade",
  },
  charts: {
    id: "charts",
    disabled: true,
    button: "bronze",
  },
  guess: {
    id: "guess",
    button: "cyan",
  },
  mixer: {
    id: "mixer",
    disabled: true,
    button: "red",
  },
  gallery: {
    id: "gallery",
    button: "gold",
  },
  session: {
    id: "session",
    button: "blue",
  },
  discord: {
    id: "discord",
    href: "https://discord.com/application-directory/1097673957865443370",
    button: "indigo",
  },
  tier_list: {
    id: "tier-list",
    strings: "tier_list",
    button: "orange",
  },
  embed: {
    id: "embed",
    button: "red",
  },
  more: {
    id: "more",
    href: "https://discord.gg/nDt7AjGJQH",
    button: "plum",
  },
};
