import { ChatInputCommandInteraction } from "discord.js";
import type { PeriodType } from "./addPeriodSubCommands";

export function getCustomPeriodParams(
  interaction: ChatInputCommandInteraction,
  forcedNonCustomPeriod = false
) {
  if (
    !forcedNonCustomPeriod &&
    (interaction.options.getSubcommand() as PeriodType) === "custom"
  ) {
    return {
      start: interaction.options.getInteger("start", true),
      end: interaction.options.getInteger("end", true),
    };
  }

  return undefined;
}
