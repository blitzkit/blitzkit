import {
  TANK_CLASSES,
  TIER_ROMAN_NUMERALS,
  TankDefinition,
  flags,
  getAccountInfo,
  getTankStats,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import markdownEscape from "markdown-escape";
import {
  gameDefinitions,
  tankDefinitions,
} from "../core/blitzkit/nonBlockingPromises";
import { addTierChoices } from "../core/discord/addTierChoices";
import { addUsernameChoices } from "../core/discord/addUsernameChoices";
import { autocompleteUsername } from "../core/discord/autocompleteUsername";
import { chunkLines } from "../core/discord/chunkLines";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { resolvePlayerFromCommand } from "../core/discord/resolvePlayerFromCommand";
import { translator } from "../core/localization/translator";
import { type CommandRegistry } from "../events/interactionCreate";

export const ownedTanksCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand("owned-tanks")
      .addStringOption(addTierChoices)
      .addStringOption(addUsernameChoices),

    async handler(interaction) {
      const { strings, unwrap } = translator(interaction.locale);
      const tier = Number(interaction.options.getString("tier"));
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const accountInfo = await getAccountInfo(region, id);
      const tankStats = await getTankStats(region, id);

      if (tankStats === null) {
        return strings.bot.common.errors.no_tank_stats;
      }

      const filteredTanks = (
        await Promise.all(
          tankStats.map(async (tankData) => ({
            tankDefinitions: (await tankDefinitions).tanks[tankData.tank_id]!,
            id: tankData.tank_id,
          }))
        )
      ).filter((tank) => tank.tankDefinitions?.tier === tier);
      const groupedTanks: Record<string, TankDefinition[]> = {};
      const nations: string[] = [];

      filteredTanks.forEach((tank) => {
        if (groupedTanks[tank.tankDefinitions.nation] === undefined) {
          groupedTanks[tank.tankDefinitions.nation] = [tank.tankDefinitions];
          nations.push(tank.tankDefinitions.nation);
        } else {
          groupedTanks[tank.tankDefinitions.nation].push(tank.tankDefinitions);
        }
      });

      const awaitedTankDefinitions = await tankDefinitions;
      const awaitedGameDefinitions = await gameDefinitions;
      const title = literals(strings.bot.commands.owned_tanks.body.title, {
        name: markdownEscape(accountInfo.nickname),
        tier: TIER_ROMAN_NUMERALS[tier],
      });
      const tankList = tankStats
        .map(({ tank_id }) => awaitedTankDefinitions.tanks[tank_id])
        .filter((tank) => tank.tier === tier)
        .sort(
          (a, b) =>
            TANK_CLASSES.indexOf(a.class) - TANK_CLASSES.indexOf(b.class)
        )
        .sort(
          (a, b) =>
            awaitedGameDefinitions.nations.indexOf(a.nation) -
            awaitedGameDefinitions.nations.indexOf(b.nation)
        )
        .map(
          (tank) =>
            `[${flags[tank.nation]} ${markdownEscape(unwrap(tank.name))}](<https://blitzkit.app/tanks/${tank.slug}>)`
        );
      const lines = [title, ...tankList];

      return chunkLines(lines);
    },

    autocomplete: autocompleteUsername,
  });
});
