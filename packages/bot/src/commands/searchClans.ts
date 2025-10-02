import { ClanList, fetchBlitz, Region } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { Locale } from "discord.js";
import markdownEscape from "markdown-escape";
import { addClanChoices } from "../core/discord/addClanChoices";
import { addRegionChoices } from "../core/discord/addRegionChoices";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { embedInfo } from "../core/discord/embedInfo";
import { localizationObject } from "../core/discord/localizationObject";
import { translator } from "../core/localization/translator";
import { CommandRegistry } from "../events/interactionCreate";

const DEFAULT_LIMIT = 25;

export const searchClansCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand("search-clans")
      .addStringOption(addRegionChoices)
      .addStringOption((option) =>
        addClanChoices(option).setAutocomplete(false)
      )
      .addIntegerOption((option) => {
        const { strings } = translator(Locale.EnglishUS);

        return option
          .setName(strings.bot.commands.search_clans.options.limit.name)
          .setNameLocalizations(
            localizationObject(
              (strings) => strings.bot.commands.search_clans.options.limit.name,
              undefined,
              true
            )
          )
          .setDescription(
            literals(
              strings.bot.commands.search_clans.options.limit.description,
              { limit: DEFAULT_LIMIT }
            )
          )
          .setDescriptionLocalizations(
            localizationObject(
              (strings) =>
                strings.bot.commands.search_clans.options.limit.description,
              { limit: DEFAULT_LIMIT }
            )
          )
          .setMinValue(1)
          .setMaxValue(100);
      }),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      const region = interaction.options.getString("region") as Region;
      const clan = interaction.options.getString("clan")!;
      const limit = interaction.options.getInteger("limit") ?? DEFAULT_LIMIT;
      const clanList = await fetchBlitz<ClanList>(region, "clans/list", {
        search: clan,
        limit,
      });

      return embedInfo(
        literals(strings.bot.commands.search_clans.body.title, {
          search: markdownEscape(clan),
          region: strings.common.regions.normal[region],
        }),
        clanList.length === 0
          ? strings.bot.commands.search_clans.body.no_results
          : `\`\`\`\n${clanList
              .map((clan) => `${clan.name} [${clan.tag}]`)
              .join("\n")}\n\`\`\``
      );
    },
  });
});
