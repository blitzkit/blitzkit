import { PlusIcon } from "@radix-ui/react-icons";
import { tierListInsertionMarker, tierListTable } from "../../config/tierList";
import { withLocale } from "../../hocs/withLocale";
import { useStrings } from "../../hooks/useStrings";
import { createTierListRow, TierList } from "../../stores/tierList";
import { Button } from "../Button";
import { InsertionMarker } from "../InsertionMarker";
import { Table } from "../Table";
import { TierListRow } from "../TierListRow";
import styles from "./index.module.css";

export const TierListTable = withLocale(Content);

function Content() {
  const strings = useStrings();
  const rows = TierList.useDeferred(
    (state) => state.rows,
    TierList.initial.rows,
  );

  return (
    <>
      <Table.Root className={styles.table}>
        <Table.Body ref={tierListTable} className={styles.body}>
          {rows.map((row, index) => (
            <TierListRow key={index} index={index} row={row} />
          ))}

          <Table.Row>
            <Table.Cell colSpan={2} className={styles.add}>
              <Button
                variant="ghost"
                className={styles.button}
                onClick={() => {
                  TierList.mutate((draft) => {
                    draft.rows.push(createTierListRow(draft.rows.length));
                  });
                }}
              >
                <PlusIcon />
                {strings.tier_list.add}
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      <InsertionMarker ref={tierListInsertionMarker} />
    </>
  );
}
