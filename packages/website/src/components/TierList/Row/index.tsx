import { Flex, Table } from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import { api } from "../../../blitzkit/api";
import { TierList } from "../../../stores/tierList";
import { tierListRowElements } from "../Table/constants";
import { TierListTile } from "../Tile";
import { Header } from "./components/Header";

interface TierListRowProps {
  index: number;
}

const tankDefinitions = await api.tanks();

export function TierListRow({ index }: TierListRowProps) {
  const tanks = TierList.use((state) => state.rows[index].tanks);
  const row = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!row.current) return;

    tierListRowElements.add(row.current);

    return () => {
      if (!row.current) return;

      tierListRowElements.delete(row.current);
    };
  });

  return (
    <Table.Row ref={row} data-index={index}>
      <Header index={index} />

      <Table.Cell>
        <Flex wrap="wrap" height="100%">
          {tanks.map((id, tankIndex) => {
            const tank = tankDefinitions.tanks[id];
            return (
              <TierListTile
                isPlaced
                key={id}
                tank={tank}
                rowIndex={index}
                tileIndex={tankIndex}
              />
            );
          })}
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}
