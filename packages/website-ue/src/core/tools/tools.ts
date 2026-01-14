import type { ButtonProps } from "@radix-ui/themes";

export interface Tool {
  id: string;
  strings?: string;

  button: ButtonProps["color"];
  significant?: boolean;
  disabled?: boolean;
  href?: string;

  background_position: "top" | "center" | "bottom";
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",
    strings: "tankopedia",
    button: "purple",
    significant: true,

    background_position: "top",
  },

  avatars: {
    id: "avatars",
    button: "gold",

    background_position: "bottom",
  },

  backgrounds: {
    id: "backgrounds",
    button: "gold",
  },

  api: {
    id: "api",
    disabled: true,
    button: "lime",
  },
};
