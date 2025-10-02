import { fetchTankDefinitions, TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { Locale } from "discord.js";
import { StatFilters } from "../blitzstars/filterStats";
import { translator } from "../localization/translator";

export async function filtersToDescription(
  { nation, tier, type, class: tankClass, tank }: StatFilters,
  locale: Locale
) {
  const { strings, bkLocale } = translator(locale);
  const awaitedTankDefinitions = await fetchTankDefinitions();
  const info: string[] = [];

  // TODO: somehow localize tank names?
  if (tank) return awaitedTankDefinitions.tanks[tank].name.locales[bkLocale];
  if (nation)
    info.push((strings.common.nations as Record<string, string>)[nation]);
  if (tier) {
    info.push(
      literals(strings.bot.common.filters.tier, {
        tier: TIER_ROMAN_NUMERALS[tier],
      })
    );
  }
  if (tankClass) info.push(strings.common.tank_class_short[tankClass]);
  if (type) info.push(strings.common.tree_type[type]);

  return info.length === 0 ? strings.bot.common.filters.none : info.join(", ");
}
