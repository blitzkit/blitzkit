import {
  AverageDefinitionsEntry,
  formatCompact,
  type BlitzkitStats,
} from '@blitzkit/core';
import { Table } from '@radix-ui/themes';
import { memo, useCallback } from 'react';
import { awaitableAverageDefinitions } from '../../core/awaitables/averageDefinitions';
import { useAveragesExclusionRatio } from '../../hooks/useAveragesExclusionRatio';
import { useLocale } from '../../hooks/useLocale';
import { Performance } from '../../stores/performance';
import { StickyRowHeaderCell } from '../StickyRowHeaderCell';

interface AverageDefinitionsEntryWithId extends AverageDefinitionsEntry {
  id: number;
}

interface TotalProps {
  tanks: AverageDefinitionsEntryWithId[];
}

const averageDefinitions = await awaitableAverageDefinitions;

export const Total = memo<TotalProps>(
  ({ tanks }) => {
    const playerCountPeriod = Performance.use(
      (state) => state.playerCountPeriod,
    );
    const { strings, locale } = useLocale();
    const ratio = useAveragesExclusionRatio();
    const sum = useCallback(
      (slice: (tank: BlitzkitStats) => number) => {
        return tanks.reduce(
          (acc, tank) => acc + tank.samples[playerCountPeriod] * slice(tank.mu),
          0,
        );
      },
      [tanks],
    );

    const battles = sum(({ battles }) => battles);
    const winrate = sum(({ wins }) => wins) / battles;
    const damage = sum(({ damage_dealt }) => damage_dealt) / battles;
    const survival = sum(({ survived_battles }) => survived_battles) / battles;
    const xp = sum(({ xp }) => xp) / battles;
    const kills = sum(({ frags }) => frags) / battles;
    const spots = sum(({ spotted }) => spotted) / battles;
    const hits = sum(({ hits }) => hits) / battles;
    const shots = sum(({ shots }) => shots) / battles;
    const accuracy = hits / shots;
    const damageReceived =
      sum(({ damage_received }) => damage_received) / battles;
    const damageRatio = damage / damageReceived;
    const capturePoints = sum(({ capture_points }) => capture_points) / battles;

    return (
      <Table.Row>
        <StickyRowHeaderCell style={{ overflow: 'hidden', display: 'flex' }}>
          {strings.website.tools.performance.table.tanks.total}
        </StickyRowHeaderCell>
        <Table.Cell align="center">{(winrate * 100).toFixed(1)}%</Table.Cell>
        <Table.Cell align="center">
          {formatCompact(
            locale,
            ratio * averageDefinitions.samples[playerCountPeriod],
          )}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(damage).toLocaleString(locale)}
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(survival * 100).toFixed(1)}%
        </Table.Cell>
        <Table.Cell align="center">
          {Math.round(xp).toLocaleString(locale)}
        </Table.Cell>
        <Table.Cell align="center">{kills.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">{spots.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">{(accuracy * 100).toFixed(0)}%</Table.Cell>
        <Table.Cell align="center">{shots.toFixed(1)}</Table.Cell>
        <Table.Cell align="center">{hits.toFixed(1)}</Table.Cell>
        <Table.Cell align="center">{damageRatio.toFixed(2)}</Table.Cell>
        <Table.Cell align="center">
          {Math.round(damageReceived).toLocaleString(locale)}
        </Table.Cell>
        <Table.Cell align="center">{capturePoints.toFixed(2)}</Table.Cell>
      </Table.Row>
    );
  },
  (prev, next) => prev.tanks === next.tanks,
);
