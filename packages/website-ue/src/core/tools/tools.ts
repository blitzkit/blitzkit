import type { Color } from "../ui/color";

export interface Tool {
  id: string;

  accent: Color;
  banner_background_position: "top" | "center" | "bottom";
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",

    accent: "plum",
    banner_background_position: "top",
  },

  players: {
    id: "players",

    accent: "pink",
    banner_background_position: "top",
  },

  compare: {
    id: "compare",

    accent: "crimson",
    banner_background_position: "bottom",
  },

  performance: {
    id: "performance",

    accent: "jade",
    banner_background_position: "bottom",
  },

  avatars: {
    id: "avatars",

    accent: "gold",
    banner_background_position: "bottom",
  },

  backgrounds: {
    id: "backgrounds",

    accent: "gold",
    banner_background_position: "bottom",
  },

  playlist: {
    id: "playlist",

    accent: "tomato",
    banner_background_position: "bottom",
  },

  mixer: {
    id: "mixer",

    accent: "gray",
    banner_background_position: "bottom",
  },

  guesser: {
    id: "guesser",

    accent: "cyan",
    banner_background_position: "bottom",
  },

  session: {
    id: "session",

    accent: "blue",
    banner_background_position: "bottom",
  },

  api: {
    id: "api",

    accent: "brown",
    banner_background_position: "bottom",
  },

  changelogs: {
    id: "changelogs",

    accent: "gray",
    banner_background_position: "bottom",
  },
};
