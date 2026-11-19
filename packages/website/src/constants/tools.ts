export interface Tool {
  id: string;

  slug?: string;
  href?: string;

  disabled?: boolean;

  banner_background_position: "top" | "center" | "bottom";
  hide_in_navbar?: boolean;
  hide_in_navbar_desktop?: boolean;
}

export const tools: Record<string, Tool> = {
  home: {
    id: "home",
    banner_background_position: "center",
    hide_in_navbar_desktop: true,
  },
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
    slug: "tier-list",
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
    hide_in_navbar: true,
  },
  credits: {
    disabled: true,
    id: "credits",
    banner_background_position: "center",
    hide_in_navbar: true,
  },
};

export enum ToolBannerSize {
  Thumbnail = "thumbnail",
  Poster = "poster",
  Full = "full",
}

export const TOOL_BANNER_HEIGHTS: Record<ToolBannerSize, number | null> = {
  [ToolBannerSize.Thumbnail]: 128,
  [ToolBannerSize.Poster]: 480 * 1.5,
  [ToolBannerSize.Full]: null,
};
