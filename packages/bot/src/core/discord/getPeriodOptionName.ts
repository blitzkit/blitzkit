import { literals } from "@blitzkit/i18n";
import { Locale } from "discord.js";
import { translator } from "../localization/translator";
import { PeriodSize } from "./addPeriodSubCommands";

export function getPeriodOptionName(period: PeriodSize, locale: Locale) {
  const { strings } = translator(locale);
  if (period === "career") return strings.bot.common.periods.career;
  if (period === "today") return strings.bot.common.periods.today;
  return literals(strings.bot.common.periods.days, { days: period });
}
