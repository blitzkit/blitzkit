import { getTimeDaysAgo, type Region } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { type CacheType, ChatInputCommandInteraction } from "discord.js";
import { getPeriodNow } from "../blitzkit/getPeriodNow";
import { getPeriodStart } from "../blitzkit/getPeriodStart";
import { translator } from "../localization/translator";
import type { PeriodType } from "./addPeriodSubCommands";
import { getPeriodOptionName } from "./getPeriodOptionName";

export interface ResolvedPeriod {
  name: string;
  start: number;
  end: number;
}

export function resolvePeriodFromCommand(
  region: Region,
  interaction: ChatInputCommandInteraction<CacheType>,
  forcedPeriod?: PeriodType
) {
  const { strings } = translator(interaction.locale);
  let name: string;
  let start: number;
  let end: number;
  const periodSubcommand = forcedPeriod
    ? forcedPeriod
    : (interaction.options.getSubcommand() as PeriodType);

  if (periodSubcommand === "custom") {
    const startOption = interaction.options.getInteger("start", true);
    const endOption = interaction.options.getInteger("end", true);
    const startDaysAgoMin = Math.min(startOption, endOption);
    const endDaysAgoMax = Math.max(startOption, endOption);

    name = literals(strings.bot.common.periods.custom, {
      day_1: startDaysAgoMin,
      day_2: endDaysAgoMax,
    });
    start = getTimeDaysAgo(region, endDaysAgoMax);
    end = getTimeDaysAgo(region, startDaysAgoMin);
  } else {
    name = getPeriodOptionName(periodSubcommand, interaction.locale);
    start = getPeriodStart(region, periodSubcommand);
    end = getPeriodNow();
  }

  return {
    name,
    start,
    end,
  } satisfies ResolvedPeriod;
}
