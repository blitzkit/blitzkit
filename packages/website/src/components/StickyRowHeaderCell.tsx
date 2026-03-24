import { Table } from "@radix-ui/themes";
import type { RowHeaderCellProps } from "@radix-ui/themes/src/components/table.js";

interface Props extends RowHeaderCellProps {
  left?: string | number;
}

export function StickyRowHeaderCell({ style, left = 0, ...props }: Props) {
  return (
    <Table.RowHeaderCell
      style={{
        position: "sticky",
        left,
        backgroundColor: "var(--color-panel)",
        ...style,
      }}
      {...props}
    />
  );
}
