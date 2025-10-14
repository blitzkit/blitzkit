import {
  getWN8Percentile,
  Percentile,
  type SupplementaryStats,
} from '@blitzkit/core';
import { Locale } from 'discord.js';
import { translator } from '../../core/localization/translator';
import { PERCENTILE_COLORS } from '../PercentileIndicator/constants';
import { HeroStat } from './components/HeroStat';
import {
  WN8SurroundingStat,
  WN8SurroundingStatAlign,
} from './components/WN8SurroundingStat';

export interface AllStatsOverviewProps {
  stats: {
    battles: number;
    wins: number;
    damage_dealt: number;
    damage_received: number;
    survived_battles: number;
    hits: number;
    shots: number;
    frags: number;
  };
  supplementaryStats: SupplementaryStats;
  locale: Locale;
}

export function AllStatsOverview({
  stats,
  locale,
  supplementaryStats,
}: AllStatsOverviewProps) {
  const { strings } = translator(locale);
  const percentile =
    typeof supplementaryStats.WN8 === 'number'
      ? getWN8Percentile(supplementaryStats.WN8)
      : Percentile.VeryBad;
  const color = PERCENTILE_COLORS[percentile];

  const heroStat =
    typeof supplementaryStats.WN8 === 'number'
      ? supplementaryStats.WN8.toFixed(0)
      : '--';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: -64,
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
          flex: 1,
        }}
      >
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.battles}
          value={stats.battles.toLocaleString()}
          align={WN8SurroundingStatAlign.Right}
        />
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.winrate}
          value={`${(100 * (stats.wins / stats.battles)).toFixed(2)}%`}
          align={WN8SurroundingStatAlign.Right}
          padded
        />
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.damage}
          value={Math.round(
            stats.damage_dealt / stats.battles,
          ).toLocaleString()}
          align={WN8SurroundingStatAlign.Right}
          padded
        />
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.damage_ratio}
          value={(stats.damage_dealt / stats.damage_received).toFixed(2)}
          align={WN8SurroundingStatAlign.Right}
        />
      </div>

      <HeroStat
        value={heroStat}
        subtitle={strings.common.wn8_percentile[percentile]}
        color={color}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
        }}
      >
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.tier}
          value={
            supplementaryStats.tier ? supplementaryStats.tier.toFixed(2) : '--'
          }
        />
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.survival}
          value={`${(100 * (stats.survived_battles / stats.battles)).toFixed(
            2,
          )}%`}
          padded
        />
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.accuracy}
          value={`${(100 * (stats.hits / stats.shots)).toFixed(2)}%`}
          padded
        />
        <WN8SurroundingStat
          label={strings.bot.common.hero_stats.kills}
          value={(stats.frags / stats.battles).toFixed(2)}
        />
      </div>
    </div>
  );
}
