import { Table } from "@radix-ui/themes";
import type { CellProps } from "@radix-ui/themes/components/table";

export enum CompareCellDirection {
  HIGHER_IS_BETTER,
  LOWER_IS_BETTER,
}

interface CompareCellProps extends CellProps {
  value: number;
  truth: number;
  direction?: CompareCellDirection;
}

export function CompareCell({
  value,
  truth,
  style,
  direction,
  ...props
}: CompareCellProps) {
  const percentage = value / truth - 1;
  const shiftedPercentage = Math.round(
    Math.min(100, Math.abs(percentage) * 2 * 100 + 25)
  );

  return (
    <Table.Cell
      style={{
        backgroundColor:
          value === truth
            ? undefined
            : (direction === CompareCellDirection.HIGHER_IS_BETTER) ===
              value > truth
            ? `color-mix(in srgb, var(--green-7) ${shiftedPercentage}%, var(--green-3))`
            : `color-mix(in srgb, var(--red-7) ${shiftedPercentage}%, var(--red-3))`,
      }}
      {...props}
    />
  );
}
