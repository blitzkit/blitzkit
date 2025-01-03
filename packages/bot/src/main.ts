// import { assertSecret, EventManager } from '@blitzkit/core';
// import { ActivityType, ShardingManager } from 'discord.js';
// import {
//   discoveredIdsDefinitions,
//   tankDefinitions,
// } from './core/blitzkit/nonBlockingPromises';

import { assertSecret } from '@blitzkit/core';
import { ActivityType, ShardingManager } from 'discord.js';
import {
  discoveredIdsDefinitions,
  tankDefinitions,
} from './core/blitzkit/nonBlockingPromises';

let iteration = 0;
const interval = setInterval(async () => {
  iteration++;

  console.log(`Attempting launch on iteration ${iteration}`);

  const manager = new ShardingManager('dist/bot/workers/bot.js', {
    token: assertSecret(import.meta.env.DISCORD_TOKEN),
  });

  const shards = await manager
    .on('shardCreate', (shard) => {
      clearInterval(interval);
      console.log(`🟡 Launching shard ${shard.id}`);
      shard.on('ready', () => console.log(`🟢 Launched shard ${shard.id}`));
    })
    .spawn();

  try {
    let servers = 0;
    let channels = 0;
    let users = 0;

    for (const [, shard] of shards) {
      // wtf is this typing bro???
      const guilds = (await shard.fetchClientValue('guilds.cache')) as any;

      servers += guilds.length;

      for (const guild of guilds) {
        channels += guild.channels.length;
        users += guild.memberCount;
      }
    }

    const awaitedTankDefinitions = await tankDefinitions;
    const tanks = Object.values(awaitedTankDefinitions.tanks).length;
    const awaitedDiscoveredIdsDefinitions = await discoveredIdsDefinitions;
    const usernames = awaitedDiscoveredIdsDefinitions.count;

    manager.broadcastEval(
      (client, { servers, users, channels, tanks, usernames }) => {
        const bios = [
          `Living in ${servers.toLocaleString()} servers`,
          `Serving ${users.toLocaleString()} users`,
          `Observing ${channels.toLocaleString()} channels`,
          `Tinkering with ${tanks.toLocaleString()} tanks`,
          `Memorizing ${usernames.toLocaleString()} usernames`,
        ];

        client.user?.setPresence({
          activities: [
            {
              type: ActivityType.Custom,
              name: bios[Math.floor(Math.random() * bios.length)],
            },
          ],
        });
      },
      { context: { servers, channels, users, tanks, usernames } },
    );
  } catch (error) {
    console.warn(
      'An error occurred when setting up presence, ignoring to keep the process alive',
      error,
    );
  }
}, 5000);
