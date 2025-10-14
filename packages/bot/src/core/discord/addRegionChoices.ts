import { REGIONS } from "@blitzkit/core";
import {
  type APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandStringOption,
} from "discord.js";
import { translator } from "../localization/translator";
import { localizationObject } from "./localizationObject";

export function addRegionChoices(option: SlashCommandStringOption) {
  const { strings } = translator(Locale.EnglishUS);

  return option
    .setName(strings.bot.common.options.region.name)
    .setNameLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.region.name,
        undefined,
        true
      )
    )
    .setDescription(strings.bot.common.options.region.description)
    .setDescriptionLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.region.description
      )
    )
    .addChoices(
      ...REGIONS.map(
        (region) =>
          ({
            value: region,
            name: strings.common.regions.normal[region],
            name_localizations: localizationObject(
              (strings) => strings.common.regions.normal[region]
            ),
          }) satisfies APIApplicationCommandOptionChoice
      )
    )
    .setRequired(true);
}
