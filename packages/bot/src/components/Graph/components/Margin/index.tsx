import { times } from 'lodash-es';
import { theme } from '../../../../stitches.config';
import { type MarginInputProps } from '../Root';
import { MarginOrientation } from './constants';

interface MarginProps extends MarginInputProps {
  verticalSeparations: number;
  orientation?: MarginOrientation;
}

export function Margin({
  verticalSeparations,
  max,
  min,
  suffix,
  precision = 0,
  orientation = MarginOrientation.Vertical,
}: MarginProps) {
  const isVertical = orientation === MarginOrientation.Vertical;

  return (
    <div
      style={{
        paddingLeft: isVertical ? 0 : 64,
        width: isVertical ? 48 : '100%',
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row-reverse',
        justifyContent: 'space-between',
      }}
    >
      {times(verticalSeparations, (index) => (
        <span
          key={index}
          style={{
            fontSize: 16,
            color: theme.colors.textHighContrast,
          }}
        >
          {`${(
            (max - min) *
              ((verticalSeparations - (index + 1)) /
                (verticalSeparations - 1)) +
            min
          ).toFixed(precision)}${suffix ?? ''}`}
        </span>
      ))}
    </div>
  );
}
