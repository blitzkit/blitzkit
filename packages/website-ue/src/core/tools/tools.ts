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
  avatars: {
    id: "avatars",
    button: "gold",
  },
  api: {
    id: "api",
    disabled: true,
    button: "bronze",
  },
};
