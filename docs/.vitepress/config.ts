import { compareVersions } from 'compare-versions';
import { readdirSync } from 'fs';
import { parse } from 'path';
import { defineConfig } from 'vitepress';
import { getSidebar } from 'vitepress-plugin-auto-sidebar';

export default defineConfig({
  title: 'blitzkrieg',
  description: '🎉 All-in-one Discord bot for everything World of Tanks Blitz',
  base: '/blitzkrieg/',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      ...getSidebar({
        collapsed: false,
        contentDirs: ['guide', 'legal'],
        contentRoot: '/docs/',
      }),

      {
        text: 'Changelogs',
        items: readdirSync('./docs/changelogs')
          .map((file) => parse(file).name)
          .sort(compareVersions)
          .map((name) => ({ text: name, link: `/changelogs/${name}.html` })),
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
});
