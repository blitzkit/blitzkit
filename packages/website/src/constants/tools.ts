export interface Tool {
  id: string;

  path?: string;
  href?: string;

  disabled?: boolean;

  banner_background_position: "top" | "center" | "bottom";
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",
    banner_background_position: "top",
  },
  players: {
    disabled: true,
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
    disabled: true,
    id: "playlist",
    banner_background_position: "bottom",
  },
  mixer: {
    disabled: true,
    id: "mixer",
    banner_background_position: "bottom",
  },
  guesser: {
    id: "guesser",
    banner_background_position: "bottom",
  },
  avatars: {
    disabled: true,
    id: "avatars",
    banner_background_position: "bottom",
  },
  backgrounds: {
    disabled: true,
    id: "backgrounds",
    banner_background_position: "bottom",
  },
  session: {
    disabled: true,
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
    disabled: true,
    id: "api",
    banner_background_position: "bottom",
  },
  changelogs: {
    disabled: true,
    id: "changelogs",
    banner_background_position: "bottom",
  },
  settings: {
    id: "settings",
    banner_background_position: "center",
  },
  credits: {
    disabled: true,
    id: "credits",
    banner_background_position: "center",
  },
};
