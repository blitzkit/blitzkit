import { TankDefinition, formatCompact } from '@blitzkit/core';
import { Table } from '@radix-ui/themes';
import { memo } from 'react';
import { awaitableAverageDefinitions } from '../../core/awaitables/averageDefinitions';
import { useAveragesExclusionRatio } from '../../hooks/useAveragesExclusionRatio';
import { useLocale } from '../../hooks/useLocale';
import { Performance } from '../../stores/performance';
import { TankRowHeaderCell } from '../TankRowHeaderCell';

interface TankRowProps {
  tank: TankDefinition;
}

const averageDefinitions = await awaitableAverageDefinitions;

export const TankRow = memo<TankRowProps>(
  ({ tank }) => {
    const averages = averageDefinitions.averages[tank.id];
    const ratio = useAveragesExclusionRatio();
    const playerCountPeriod = Performance.use(
      (state) => state.playerCountPeriod,
    );
    const { locale } = useLocale();

    return (
      <Table.Row>
        <TankRowHeaderCell tank={tank} />

        <Table.Cell align="center">
          {((averages.mu.wins / averages.mu.battles) * 100).toFixed(1)}%
        </Table.Cell>
        <Table.Cell align="center">
          {formatCompact(
            locale,
            Math.round(ratio * averages.samples[playerCountPeriod]),
          )}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(
            averages.mu.damage_dealt / averages.mu.battles,
          ).toLocaleString(locale)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(
            (averages.mu.survived_battles / averages.mu.battles) * 100,
          )}
          %
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(averages.mu.xp / averages.mu.battles).toLocaleString(
            locale,
          )}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.frags / averages.mu.battles).toFixed(2)}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.spotted / averages.mu.battles).toFixed(2)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round((averages.mu.hits / averages.mu.shots) * 100)}%
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.shots / averages.mu.battles).toFixed(1)}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.hits / averages.mu.battles).toFixed(1)}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.damage_dealt / averages.mu.damage_received).toFixed(2)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(
            averages.mu.damage_received / averages.mu.battles,
          ).toLocaleString(locale)}
        </Table.Cell>
        <Table.Cell align="center">
          {(averages.mu.capture_points / averages.mu.battles).toFixed(2)}
        </Table.Cell>
      </Table.Row>
    );
  },
  (prev, next) => prev.tank.id === next.tank.id,
);
