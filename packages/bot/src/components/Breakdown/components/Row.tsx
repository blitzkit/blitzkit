import {
  Percentile,
  TankClass,
  TankType,
  TREE_TYPE_ICONS,
} from '@blitzkit/core';
import { createColors } from 'bepaint';
import {
  type AccentColor,
  type GrayColor,
  PALETTES,
} from '../../../core/radix/radixColors';
import { RowStat } from './RowStat';

export interface RowStatItem {
  title: string;
  current?: number | string;
  career?: number | string;
  delta?: number;
  percentile?: Percentile;
}

interface RowProps {
  displayType?: 'tank' | 'summary';
  naked?: boolean;
  title: string;
  minimized?: boolean;
  type?: TankType;
  class?: TankClass;
  color?: AccentColor | GrayColor;
  stats: (RowStatItem | undefined)[];
}

export function Row({
  color = 'slate',
  stats,
  title,
  minimized,
  class: tankClass,
  type,
  naked = false,
  displayType,
}: RowProps) {
  const palette = PALETTES[`${color}Dark`];
  const theme = createColors(palette);

  return (
    <div
      className="session-tracker-row"
      style={{
        maxWidth: naked ? 600 : Infinity,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        backgroundColor: naked
          ? `${theme.appBackground2}c0`
          : theme.appBackground2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          gap: 4,
          backgroundColor: naked
            ? `${theme.componentInteractive}c0`
            : theme.componentInteractive,
        }}
      >
        {displayType === 'tank' && tankClass !== undefined && (
          <img
            alt={TankClass[tankClass]}
            src={TREE_TYPE_ICONS[type ?? TankType.RESEARCHABLE][tankClass]}
            style={{ width: 16, height: 16 }}
          />
        )}

        <span
          style={{
            color:
              displayType === 'tank'
                ? type === TankType.COLLECTOR
                  ? theme.textLowContrast_blue
                  : type === TankType.PREMIUM
                    ? theme.textLowContrast_amber
                    : theme.textHighContrast
                : theme.textLowContrast,
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {stats.map(
          (row, index) =>
            row && (
              <RowStat
                minimized={minimized}
                key={index}
                name={`${row.title} • ${row.career ?? '--'}`}
                value={row.current ?? '--'}
                delta={row.delta}
                percentile={row.percentile}
              />
            ),
        )}
      </div>
    </div>
  );
}
