export interface Tool {
  id: string;

  path?: string;
  href?: string;

  banner_background_position: "top" | "center" | "bottom";
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",
    banner_background_position: "top",
  },
  players: {
    id: "players",
    banner_background_position: "top",
  },
  compare: {
    id: "compare",
    banner_background_position: "bottom",
  },
  performance: {
    id: "performance",
    banner_background_position: "bottom",
  },
  playlist: {
    id: "playlist",
    banner_background_position: "bottom",
  },
  mixer: {
    id: "mixer",
    banner_background_position: "bottom",
  },
  guesser: {
    id: "guesser",
    banner_background_position: "bottom",
  },
  avatars: {
    id: "avatars",
    banner_background_position: "bottom",
  },
  backgrounds: {
    id: "backgrounds",
    banner_background_position: "bottom",
  },
  session: {
    id: "session",
    banner_background_position: "bottom",
  },
  tier_list: {
    id: "tier_list",
    banner_background_position: "bottom",
  },
  embed: {
    id: "embed",
    banner_background_position: "bottom",
  },
  more: {
    id: "more",
    href: "https://discord.gg/nDt7AjGJQH",
    banner_background_position: "bottom",
  },
  api: {
    id: "api",
    banner_background_position: "bottom",
  },
  changelogs: {
    id: "changelogs",
    banner_background_position: "bottom",
  },
  settings: {
    id: "changelogs",
    banner_background_position: "center",
  },
};
