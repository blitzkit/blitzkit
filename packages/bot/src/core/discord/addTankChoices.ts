import { Locale, SlashCommandStringOption } from "discord.js";
import { translator } from "../localization/translator";
import { localizationObject } from "./localizationObject";

export function addTankChoices(option: SlashCommandStringOption) {
  const { strings } = translator(Locale.EnglishUS);

  return option
    .setName(strings.bot.common.options.tank.name!)
    .setNameLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.tank.name,
        undefined,
        true,
      ),
    )
    .setDescription(strings.bot.common.options.tank.description)
    .setDescriptionLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.tank.description,
      ),
    )
    .setAutocomplete(true)
    .setRequired(true);
}
