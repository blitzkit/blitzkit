import { numberToRomanNumeral } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import {
  APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandStringOption,
} from "discord.js";
import { range } from "lodash-es";
import { translator } from "../localization/translator";
import { localizationObject } from "./localizationObject";

export function addTierChoices(option: SlashCommandStringOption) {
  const { strings } = translator(Locale.EnglishUS);

  return option
    .setName(strings.bot.common.options.tier.name)
    .setNameLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.tier.name,
        undefined,
        true
      )
    )
    .setDescription(strings.bot.common.options.tier.description)
    .setDescriptionLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.tier.description
      )
    )
    .setChoices(
      ...range(10, 0).map(
        (tier) =>
          ({
            name: literals(strings.bot.common.options.tier.choices.tier, {
              tier_1: tier,
              tier_2: numberToRomanNumeral(tier),
            }),
            value: `${tier}`,
            name_localizations: localizationObject(
              (strings) => strings.bot.common.options.tier.choices.tier,
              { tier_1: tier, tier_2: numberToRomanNumeral(tier) }
            ),
          }) satisfies APIApplicationCommandOptionChoice
      )
    )
    .setRequired(true);
}
