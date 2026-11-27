import type { TierListRowState } from "../../stores/tierList";
import { Table } from "../Table";
import { TankCardWrapper } from "../TankCardWrapper";
import { TierListRowHeader } from "../TierListRowHeader";
import { TierListTile } from "../TierListTile";
import styles from "./index.module.css";

interface TierListRowProps {
  index: number;
  row: TierListRowState;
}

export function TierListRow({ index, row }: TierListRowProps) {
  return (
    <Table.Row data-row={index}>
      <TierListRowHeader index={index} row={row} />

      <Table.Cell className={styles.tanks} data-tier-cell>
        <TankCardWrapper className={styles.wrapper} data-tier-grid>
          {row.tanks.map((id) => (
            <TierListTile key={id} id={id} />
          ))}
        </TankCardWrapper>
      </Table.Cell>
    </Table.Row>
  );
}
