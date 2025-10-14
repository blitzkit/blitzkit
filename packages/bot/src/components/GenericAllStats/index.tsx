import {
  type BlitzStats,
  getWN8Percentile,
  isNumber,
  type SupplementaryStats,
} from '@blitzkit/core';
import { Locale } from 'discord.js';
import { translator } from '../../core/localization/translator';
import { Card } from './components/Card';
import { Root } from './components/Root';
import { Row } from './components/Row';

interface GenericAllStatsProps {
  stats: BlitzStats;
  supplementaryStats?: SupplementaryStats;
  locale: Locale;
}

export function GenericAllStats({
  stats,
  supplementaryStats,
  locale,
}: GenericAllStatsProps) {
  const { strings } = translator(locale);
  const damageRatio = stats.damage_dealt / stats.damage_received;
  const killsToDeathRatio =
    stats.frags / (stats.battles - stats.survived_battles);

  return (
    <Root>
      <Row>
        <Card
          title={strings.bot.commands.full_stats.body.cards.games.title}
          items={[
            {
              label: strings.bot.commands.full_stats.body.cards.games.winrate,
              value: `${(100 * (stats.wins / stats.battles)).toFixed(2)}%`,
            },
            {
              label: strings.bot.commands.full_stats.body.cards.games.battles,
              value: stats.battles,
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.games.wins_losses,
              value: `${stats.wins} / ${stats.losses}`,
            },
          ]}
        />
        <Card
          title={strings.bot.commands.full_stats.body.cards.efficiency.title}
          items={[
            {
              label: strings.bot.commands.full_stats.body.cards.efficiency.wn8,
              value:
                supplementaryStats && isNumber(supplementaryStats.WN8)
                  ? supplementaryStats.WN8!.toFixed(0)
                  : undefined,
              percentile: isNumber(supplementaryStats?.WN8)
                ? getWN8Percentile(supplementaryStats!.WN8!)
                : undefined,
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.efficiency.survival,
              value: `${(
                100 *
                (stats.survived_battles / stats.battles)
              ).toFixed(2)}%`,
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.efficiency.accuracy,
              value: `${((stats.hits / stats.shots) * 100).toFixed(2)}%`,
            },
          ]}
        />
      </Row>
      <Row>
        <Card
          title={strings.bot.commands.full_stats.body.cards.lethality.title}
          items={[
            {
              label:
                strings.bot.commands.full_stats.body.cards.lethality
                  .average_damage,
              value: (stats.damage_dealt / stats.battles).toFixed(0),
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.lethality
                  .damage_per_tier,
              value: supplementaryStats?.tier
                ? (
                    stats.damage_dealt /
                    stats.battles /
                    supplementaryStats.tier
                  ).toFixed(0)
                : undefined,
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.lethality
                  .damage_ratio,
              value: isFinite(damageRatio) ? damageRatio.toFixed(2) : undefined,
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.lethality
                  .average_kills,
              value: (stats.frags / stats.battles).toFixed(0),
            },
          ]}
        />
        <Card
          title={strings.bot.commands.full_stats.body.cards.miscellaneous.title}
          items={[
            {
              label:
                strings.bot.commands.full_stats.body.cards.miscellaneous
                  .average_tier,
              value: supplementaryStats?.tier?.toFixed(2),
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.miscellaneous
                  .average_spots,
              value: (stats.spotted / stats.battles).toFixed(2),
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.miscellaneous
                  .average_xp,
              value: (stats.xp / stats.battles).toFixed(0),
            },
            {
              label:
                strings.bot.commands.full_stats.body.cards.miscellaneous
                  .kills_to_death_ratio,
              value: isFinite(killsToDeathRatio)
                ? killsToDeathRatio.toFixed(2)
                : undefined,
            },
          ]}
        />
      </Row>
    </Root>
  );
}
