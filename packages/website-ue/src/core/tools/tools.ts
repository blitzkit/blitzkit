import {
  ExclamationTriangleIcon,
  GearIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { ComponentProps, ReactNode } from "react";
import { TankIcon } from "../../icons/Tank";
import type { Color } from "../ui/color";

export interface Tool {
  id: string;

  accent: Color;
  banner_background_position: "top" | "center" | "bottom";

  Icon:
    | ((props: ComponentProps<"svg">) => ReactNode)
    | ((props: IconProps) => ReactNode);
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",

    Icon: TankIcon,
    accent: "purple",
    banner_background_position: "top",
  },

  players: {
    id: "players",

    Icon: PersonIcon,
    accent: "purple",
    banner_background_position: "top",
  },

  settings: {
    id: "settings",

    Icon: GearIcon,
    accent: "gray",
    banner_background_position: "top",
  },

  avatars: {
    id: "avatars",

    Icon: ExclamationTriangleIcon,
    accent: "gold",
    banner_background_position: "bottom",
  },

  backgrounds: {
    id: "backgrounds",

    Icon: ExclamationTriangleIcon,
    accent: "gold",
    banner_background_position: "bottom",
  },

  api: {
    id: "api",

    Icon: ExclamationTriangleIcon,
    accent: "lime",
    banner_background_position: "bottom",
  },

  compare: {
    id: "compare",

    Icon: ExclamationTriangleIcon,
    accent: "crimson",
    banner_background_position: "bottom",
  },

  performance: {
    id: "performance",

    Icon: ExclamationTriangleIcon,
    accent: "jade",
    banner_background_position: "bottom",
  },

  playlist: {
    id: "playlist",

    Icon: ExclamationTriangleIcon,
    accent: "tomato",
    banner_background_position: "bottom",
  },

  mixer: {
    id: "mixer",

    Icon: ExclamationTriangleIcon,
    accent: "gray",
    banner_background_position: "bottom",
  },

  guesser: {
    id: "guesser",

    Icon: ExclamationTriangleIcon,
    accent: "cyan",
    banner_background_position: "bottom",
  },

  session: {
    id: "session",

    Icon: ExclamationTriangleIcon,
    accent: "blue",
    banner_background_position: "bottom",
  },
};
