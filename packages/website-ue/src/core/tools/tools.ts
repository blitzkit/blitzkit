import type { ButtonProps } from "@radix-ui/themes";

export interface Tool {
  id: string;
  strings?: string;

  button: ButtonProps["color"];
  significant?: boolean;
  disabled?: boolean;
  href?: string;

  banner_background_position: "top" | "center" | "bottom";
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",
    strings: "tankopedia",
    button: "purple",
    significant: true,

    banner_background_position: "top",
  },

  avatars: {
    id: "avatars",
    button: "gold",

    banner_background_position: "bottom",
  },

  backgrounds: {
    id: "backgrounds",
    button: "gold",

    banner_background_position: "bottom",
  },

  api: {
    id: "api",
    disabled: true,
    button: "lime",

    banner_background_position: "bottom",
  },
};
