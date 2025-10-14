import type { Region } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { ChatInputCommandInteraction } from "discord.js";
import markdownEscape from "markdown-escape";
import { searchClansAcrossRegionsBotWrapper } from "../blitz/searchClansAcrossRegionsBotWrapper";
import { UserError } from "../blitzkit/userError";
import { translator } from "../localization/translator";

export const serverAndIdPattern = /(com|eu|asia)\/[0-9]+/;

export async function resolveClanFromCommand(
  interaction: ChatInputCommandInteraction
) {
  const { strings } = translator(interaction.locale);
  const clan = interaction.options.getString("clan", true);

  if (serverAndIdPattern.test(clan)) {
    const [server, accountId] = clan.split("/");
    return { region: server as Region, id: Number(accountId) };
  } else {
    const accounts = await searchClansAcrossRegionsBotWrapper(
      clan,
      interaction.locale
    );

    if (accounts[0]) {
      return { region: accounts[0].region, id: accounts[0].clan_id };
    } else {
      throw new UserError(
        literals(strings.bot.common.errors.clan_not_found, {
          search: markdownEscape(clan),
        })
      );
    }
  }
}
