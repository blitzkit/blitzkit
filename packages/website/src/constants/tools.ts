import { Button } from "@radix-ui/themes";
import type { ComponentProps } from "react";

export interface Tool {
  id: string;
  strings?: string;
  disabled?: boolean;
  href?: string;
  button: {
    highContrast?: boolean;
    color: ComponentProps<typeof Button>["color"];
  };
  significant?: boolean;
}

export const TOOLS: Tool[] = [
  {
    id: "tanks",
    strings: "tankopedia",
    button: { color: "purple" },
    significant: true,
  },
  {
    id: "players",
    disabled: true,
    button: { color: "blue" },
  },
  {
    id: "compare",
    button: { color: "crimson" },
  },
  {
    id: "performance",
    button: { color: "jade" },
  },
  {
    id: "charts",
    disabled: true,
    button: { color: "bronze" },
  },
  {
    id: "guess",
    button: { color: "cyan" },
  },
  {
    id: "mixer",
    disabled: true,
    button: { color: "red" },
  },
  {
    id: "charts",
    disabled: true,
    button: { color: "red" },
  },
  {
    id: "gallery",
    button: { color: "gold" },
  },
  {
    id: "session",
    button: { color: "blue" },
  },
  {
    id: "discord",
    href: "https://discord.com/application-directory/1097673957865443370",
    button: { color: "indigo" },
  },
  {
    id: "tier-list",
    strings: "tier_list",
    button: { color: "orange" },
  },
  {
    id: "embed",
    button: { color: "red" },
  },
  {
    id: "more",
    href: "https://discord.gg/nDt7AjGJQH",
    button: { color: "plum" },
  },
];
