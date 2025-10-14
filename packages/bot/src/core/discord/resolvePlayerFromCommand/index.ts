import { idToRegion, type Region } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { type CacheType, ChatInputCommandInteraction } from "discord.js";
import markdownEscape from "markdown-escape";
import { searchPlayersAcrossRegionsBotWrapper } from "../../blitz/searchPlayersAcrossRegionsBotWrapper";
import { getBlitzFromDiscord } from "../../blitzkit/getBlitzFromDiscord";
import { UserError } from "../../blitzkit/userError";
import { translator } from "../../localization/translator";

export interface ResolvedPlayer {
  region: Region;
  id: number;
}

export async function resolvePlayerFromCommand(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  const { strings } = translator(interaction.locale);
  const commandUsername = interaction.options.getString("username");

  if (commandUsername !== null) {
    const id = parseInt(commandUsername);

    if (!isNaN(id)) {
      const region = idToRegion(id);
      return { region, id } satisfies ResolvedPlayer;
    } else {
      const accounts = await searchPlayersAcrossRegionsBotWrapper(
        commandUsername,
        interaction.locale
      );

      if (accounts[0]) {
        return {
          region: accounts[0].region,
          id: accounts[0].account_id,
        } satisfies ResolvedPlayer;
      } else {
        throw new UserError(
          literals(strings.bot.common.errors.player_not_found, {
            search: markdownEscape(commandUsername),
          })
        );
      }
    }
  } else {
    const account = await getBlitzFromDiscord(BigInt(interaction.user.id));

    if (account) return account;

    throw new UserError(strings.bot.common.errors.player_not_linked);
  }
}
