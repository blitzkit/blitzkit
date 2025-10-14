import {
  TANK_CLASSES,
  TANK_TYPE_COMMAND_NAMES,
  TANK_TYPES,
} from '@blitzkit/core';
import {
  type APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { translator } from '../localization/translator';
import { addTankChoices } from './addTankChoices';
import { addTierChoices } from './addTierChoices';
import { localizationObject } from './localizationObject';

export function addFilterOptions<
  Option extends SlashCommandBuilder | SlashCommandSubcommandBuilder,
>(option: Option, nations: string[]) {
  const { strings } = translator(Locale.EnglishUS);

  return (
    option
      .addStringOption((option) =>
        option
          .setName(strings.bot.common.options.filters.nation.name)
          .setNameLocalizations(
            localizationObject(
              (strings) => strings.bot.common.options.filters.nation.name,
              undefined,
              true,
            ),
          )
          .setDescription(strings.bot.common.options.filters.nation.description)
          .setDescriptionLocalizations(
            localizationObject(
              (strings) =>
                strings.bot.common.options.filters.nation.description,
            ),
          )
          .addChoices(
            ...nations.map(
              (nation) =>
                ({
                  value: nation,
                  name: (strings.common.nations as Record<string, string>)[
                    nation
                  ],
                  name_localizations: localizationObject(
                    (strings) =>
                      (strings.common.nations as Record<string, string>)[
                        nation
                      ],
                  ),
                }) satisfies APIApplicationCommandOptionChoice,
            ),
          )
          .setRequired(false),
      )
      .addStringOption((option) => addTierChoices(option).setRequired(false))
      .addStringOption((option) =>
        option
          .setName(strings.bot.common.options.filters.class.name)
          .setNameLocalizations(
            localizationObject(
              (strings) => strings.bot.common.options.filters.class.name,
              undefined,
              true,
            ),
          )
          .setDescription(strings.bot.common.options.filters.class.description)
          .setDescriptionLocalizations(
            localizationObject(
              (strings) => strings.bot.common.options.filters.class.description,
            ),
          )
          .addChoices(
            ...TANK_CLASSES.map(
              (tankType) =>
                ({
                  value: `${tankType}`,
                  name: strings.common.tank_class_short[tankType],
                  name_localizations: localizationObject(
                    (strings) => strings.common.tank_class_short[tankType],
                  ),
                }) satisfies APIApplicationCommandOptionChoice,
            ),
          )
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName(strings.bot.common.options.filters.type.name)
          .setNameLocalizations(
            localizationObject(
              (strings) => strings.bot.common.options.filters.type.name,
              undefined,
              true,
            ),
          )
          .setDescription(strings.bot.common.options.filters.type.description)
          .setDescriptionLocalizations(
            localizationObject(
              (strings) => strings.bot.common.options.filters.type.description,
            ),
          )
          .addChoices(
            ...TANK_TYPES.map(
              (treeType) =>
                ({
                  value: TANK_TYPE_COMMAND_NAMES[treeType],
                  name: strings.common.tree_type[treeType],
                  name_localizations: localizationObject(
                    (strings) => strings.common.tree_type[treeType],
                  ),
                }) satisfies APIApplicationCommandOptionChoice,
            ),
          )
          .setRequired(false),
      )
      // TODO: somehow localize this?
      .addStringOption((option) =>
        addTankChoices(option).setRequired(false),
      ) as Option
  );
}
