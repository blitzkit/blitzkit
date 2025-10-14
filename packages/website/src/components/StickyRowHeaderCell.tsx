import { Table } from "@radix-ui/themes";
import type { RowHeaderCellProps } from "@radix-ui/themes/src/components/table.js";

export function StickyRowHeaderCell({ style, ...props }: RowHeaderCellProps) {
  return (
    <Table.RowHeaderCell
      style={{
        display: "flex",
        position: "sticky",
        left: 0,
        backgroundColor: "var(--color-panel)",
        ...style,
      }}
      {...props}
    />
  );
}
