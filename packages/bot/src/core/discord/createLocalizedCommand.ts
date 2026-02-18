import { type BlitzKitStrings } from "@blitzkit/i18n";
import {
  Locale,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import { translator } from "../localization/translator";
import { localizationObject } from "./localizationObject";

interface CreateLocalizedCommandSubcommand {
  subcommand: string;
  modify?: (option: SlashCommandSubcommandBuilder) => void;
}

interface CreateLocalizedCommandSubcommandGroup {
  group: string;
  modify?: (option: SlashCommandSubcommandGroupBuilder) => void;
}

export function createLocalizedCommand(
  command: string,
  sub?:
    | CreateLocalizedCommandSubcommand[]
    | CreateLocalizedCommandSubcommandGroup[],
) {
  const commandPathItem = command.replaceAll(
    "-",
    "_",
  ) as keyof BlitzKitStrings["bot"]["commands"];
  const { strings } = translator(Locale.EnglishUS);
  const slashCommand = new SlashCommandBuilder()
    .setName(command)
    .setNameLocalizations(
      localizationObject(
        (strings) => strings.bot.commands[commandPathItem].name,
        undefined,
        true,
      ),
    )
    .setDescription(strings.bot.commands[commandPathItem].description)
    .setDescriptionLocalizations(
      localizationObject(
        (strings) => strings.bot.commands[commandPathItem].description,
      ),
    );

  if (sub) {
    sub.map((subItem) => {
      if ("subcommand" in subItem) {
        const subcommandNameLocalizations = localizationObject(
          (strings) =>
            (
              strings.bot.commands[commandPathItem] as unknown as {
                subcommands: Record<string, { name: string }>;
              }
            ).subcommands[subItem.subcommand].name,
          undefined,
          true,
        );
        const subcommandDescriptionLocalizations = localizationObject(
          (strings) =>
            (
              strings.bot.commands[commandPathItem] as unknown as {
                subcommands: Record<string, { description: string }>;
              }
            ).subcommands[subItem.subcommand].description,
        );

        slashCommand.addSubcommand((option) => {
          if (subItem.modify) subItem.modify(option);

          return option
            .setName(subItem.subcommand)
            .setNameLocalizations(subcommandNameLocalizations)
            .setDescription(
              (
                strings.bot.commands[commandPathItem] as unknown as {
                  subcommands: Record<string, { description: string }>;
                }
              ).subcommands[subItem.subcommand].description,
            )
            .setDescriptionLocalizations(subcommandDescriptionLocalizations);
        });
      } else {
        const subcommandNameLocalizations = localizationObject(
          (strings) =>
            (
              strings.bot.commands[commandPathItem] as unknown as {
                groups: Record<string, { name: string }>;
              }
            ).groups[subItem.group].name,
          undefined,
          true,
        );
        const subcommandDescriptionLocalizations = localizationObject(
          (strings) =>
            (
              strings.bot.commands[commandPathItem] as unknown as {
                groups: Record<string, { description: string }>;
              }
            ).groups[subItem.group].description,
        );

        slashCommand.addSubcommandGroup((option) => {
          if (subItem.modify) subItem.modify(option);

          return option
            .setName(subItem.group)
            .setNameLocalizations(subcommandNameLocalizations)
            .setDescription(
              (
                strings.bot.commands[commandPathItem] as unknown as {
                  groups: Record<string, { description: string }>;
                }
              ).groups[subItem.group].description,
            )
            .setDescriptionLocalizations(subcommandDescriptionLocalizations);
        });
      }
    });
  }

  return slashCommand;
}
