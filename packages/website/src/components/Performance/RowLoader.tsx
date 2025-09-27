import { Skeleton, Table } from "@radix-ui/themes";
import { times } from "lodash-es";
import { memo, useRef } from "react";
import { useIntersection } from "../../hooks/useIntersection";
import { TankPerformanceSortTypeNamesArray } from "../../stores/tankPerformanceSort/constants";

interface RowLoaderProps {
  onIntersection?: () => void;
}

export const RowLoader = memo<RowLoaderProps>(({ onIntersection }) => {
  const row = useRef<HTMLTableRowElement>(null!);

  useIntersection(() => onIntersection?.(), row, {
    disabled: onIntersection === undefined,
  });

  return (
    <Table.Row ref={row}>
      <Table.RowHeaderCell align="center">
        <Skeleton height="100%" width="128px" />
      </Table.RowHeaderCell>

      {times(TankPerformanceSortTypeNamesArray.length, (index) => (
        <Table.Cell key={index} align="center">
          <Skeleton height="1em" width="32px" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
});
