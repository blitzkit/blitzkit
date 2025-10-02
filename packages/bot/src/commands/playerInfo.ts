import { getAccountInfo } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import markdownEscape from "markdown-escape";
import { addUsernameChoices } from "../core/discord/addUsernameChoices";
import { autocompleteUsername } from "../core/discord/autocompleteUsername";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { embedInfo } from "../core/discord/embedInfo";
import { markdownTable } from "../core/discord/markdownTable";
import { resolvePlayerFromCommand } from "../core/discord/resolvePlayerFromCommand";
import { translator } from "../core/localization/translator";
import { CommandRegistry } from "../events/interactionCreate";

export const playerInfoCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command:
      createLocalizedCommand("player-info").addStringOption(addUsernameChoices),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      const account = await resolvePlayerFromCommand(interaction);
      const { id, region: region } = account;
      const accountInfo = await getAccountInfo(region, id);

      return embedInfo(
        literals(strings.bot.commands.player_info.body.title, {
          name: markdownEscape(accountInfo.nickname),
        }),

        markdownTable([
          [
            strings.bot.commands.player_info.body.nickname,
            `${accountInfo.nickname}`,
          ],
          [
            strings.bot.commands.player_info.body.battles,
            `${accountInfo.statistics.all.battles}`,
          ],
          [
            strings.bot.commands.player_info.body.winrate,
            `${(
              100 *
              (accountInfo.statistics.all.wins /
                accountInfo.statistics.all.battles)
            ).toFixed(2)}%`,
          ],
          [],
          [
            strings.bot.commands.player_info.body.account_id,
            `${accountInfo.account_id}`,
          ],
          [
            strings.bot.commands.player_info.body.created,
            new Date(accountInfo.created_at * 1000).toLocaleDateString(
              interaction.locale
            ),
          ],
          [
            strings.bot.commands.player_info.body.last_battle,
            new Date(accountInfo.last_battle_time * 1000).toLocaleDateString(
              interaction.locale
            ),
          ],
        ])
      );
    },

    autocomplete: autocompleteUsername,
  });
});
