import { Button } from '@radix-ui/themes';
import type { ComponentProps } from 'react';

export interface Tool {
  id: string;
  stringsId?: string;
  disabled?: boolean;
  href?: string;
  button: {
    highContrast?: boolean;
    color: ComponentProps<typeof Button>['color'];
  };
  significant?: boolean;
  branches?: string[];
}

export const tankopediaTool: Tool = {
  id: 'tanks',
  stringsId: 'tankopedia',
  button: {
    color: 'purple',
  },
  significant: true,
  branches: ['main', 'dev', 'opentest', 'preview'],
};

// export const ratingTool: Tool = {
//   id: 'rating',
//   image: 'WEyMZH3',
//   button: {
//     color: 'orange',
//   },
//   branches: ['main', 'dev'],
// };

export const compareTool: Tool = {
  id: 'compare',
  button: {
    color: 'crimson',
  },
  branches: ['main', 'dev', 'opentest', 'preview'],
};

export const sessionTool: Tool = {
  // TODO: rename to tracker
  id: 'session',
  button: {
    color: 'blue',
  },
  branches: ['main', 'dev'],
};

export const discordTool: Tool = {
  id: 'discord',
  href: 'https://discord.com/application-directory/1097673957865443370',
  button: {
    color: 'indigo',
  },
};

export const moreTool: Tool = {
  id: 'more',
  href: 'https://discord.gg/nDt7AjGJQH',
  button: {
    color: 'plum',
  },
};

export const playersTool: Tool = {
  id: 'players',
  button: {
    color: 'blue',
  },
  href: '_', // TODO: remove this to re-enable link
  branches: ['main', 'dev'],
};

export const performanceTool: Tool = {
  id: 'performance',
  button: {
    color: 'jade',
  },
  branches: ['main', 'dev'],
};

export const embedTool: Tool = {
  id: 'embed',
  button: {
    color: 'red',
  },
  branches: ['main', 'dev'],
};

export const homeTool: Tool = {
  id: 'home',
  button: { color: 'blue' },
};

export const galleryTool: Tool = {
  id: 'gallery',
  button: {
    color: 'gold',
  },
  branches: ['main', 'dev'],
};

export const tierListTool: Tool = {
  id: 'tier-list',
  stringsId: 'tier_list',
  button: {
    color: 'orange',
  },
  branches: ['main', 'dev', 'opentest', 'preview'],
};

export const chartsTool: Tool = {
  id: 'charts',
  button: {
    color: 'bronze',
  },
  branches: ['main', 'dev'],
};

export const guessTool: Tool = {
  id: 'guess',
  button: { color: 'cyan' },
  branches: ['main', 'dev', 'opentest', 'preview'],
};

export const mixerTool: Tool = {
  id: 'mixer',
  button: { color: 'red' },
  branches: ['main', 'dev', 'opentest', 'preview'],
};

export const TOOLS: Tool[] = [
  tankopediaTool,
  compareTool,
  performanceTool,
  guessTool,
  // mixerTool,
  // chartsTool,
  galleryTool,
  sessionTool,
  tierListTool,
  embedTool,
  // ratingTool,
];
