export interface Tool {
  id: string;

  path?: string;
  strings?: string;

  href?: string;
}

export const tools: Record<string, Tool> = {
  tanks: {
    id: "tanks",
    strings: "tankopedia",
  },
  players: {
    id: "players",
    strings: "players",
  },
  compare: {
    id: "compare",
  },
  performance: {
    id: "performance",
  },
  playlist: {
    id: "playlist",
  },
  mixer: {
    id: "mixer",
  },
  guesser: {
    id: "guesser",
  },
  avatars: {
    id: "avatars",
  },
  backgrounds: {
    id: "backgrounds",
  },
  session: {
    id: "session",
  },
  tier_list: {
    id: "tier_list",
  },
  embed: {
    id: "embed",
  },
  more: {
    id: "more",
    href: "https://discord.gg/nDt7AjGJQH",
  },
  api: {
    id: "api",
  },
  changelogs: {
    id: "changelogs",
  },
};
