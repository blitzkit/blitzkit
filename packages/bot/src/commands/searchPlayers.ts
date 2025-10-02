import {
  AccountList,
  fetchBlitz,
  Region,
  usernamePattern,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { Locale } from "discord.js";
import markdownEscape from "markdown-escape";
import { addRegionChoices } from "../core/discord/addRegionChoices";
import { addUsernameChoices } from "../core/discord/addUsernameChoices";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { embedInfo } from "../core/discord/embedInfo";
import { localizationObject } from "../core/discord/localizationObject";
import { translator } from "../core/localization/translator";
import { CommandRegistry } from "../events/interactionCreate";

const DEFAULT_LIMIT = 25;

export const searchPlayersCommand = new Promise<CommandRegistry>((resolve) => {
  const { strings } = translator(Locale.EnglishUS);

  resolve({
    command: createLocalizedCommand("search-players")
      .addStringOption(addRegionChoices)
      .addStringOption((option) =>
        addUsernameChoices(option).setAutocomplete(false).setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName(strings.bot.commands.search_players.options.limit.name)
          .setNameLocalizations(
            localizationObject(
              (strings) =>
                strings.bot.commands.search_players.options.limit.name,
              undefined,
              true
            )
          )
          .setDescription(
            literals(
              strings.bot.commands.search_players.options.limit.description,
              { limit: DEFAULT_LIMIT }
            )
          )
          .setDescriptionLocalizations(
            localizationObject(
              (strings) =>
                strings.bot.commands.search_players.options.limit.description,
              { limit: DEFAULT_LIMIT }
            )
          )
          .setMinValue(1)
          .setMaxValue(100)
      ),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      const region = interaction.options.getString("region") as Region;
      const name = interaction.options.getString("username")!;
      const limit = interaction.options.getInteger("limit") ?? 25;
      const trimmedSearch = name.trim();
      const players = usernamePattern.test(trimmedSearch)
        ? await fetchBlitz<AccountList>(region, "account/list", {
            search: trimmedSearch,
            limit,
          })
        : [];

      return embedInfo(
        literals(strings.bot.commands.search_players.body.title, {
          search: markdownEscape(trimmedSearch),
          region: strings.common.regions.normal[region],
        }),
        `\`\`\`${
          players.length === 0
            ? strings.bot.commands.search_players.body.no_results
            : players.map((player) => player.nickname).join("\n")
        }\`\`\``
      );
    },
  });
});
