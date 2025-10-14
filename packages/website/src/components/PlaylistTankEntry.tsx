import type { TankDefinition } from "@blitzkit/core";
import { DragHandleDots2Icon, MinusCircledIcon } from "@radix-ui/react-icons";
import { Checkbox, Flex, IconButton, Table, Text } from "@radix-ui/themes";
import { Playlist } from "../stores/playlist";
import { TankRowHeaderCell } from "./TankRowHeaderCell";

interface Props {
  tank: TankDefinition;
  checked: boolean;
  index: number;
}

export function PlaylistTankEntry({ tank, checked, index }: Props) {
  return (
    <Table.Row>
      <Table.Cell
        onClick={() => {
          Playlist.mutate((draft) => {
            draft.list![index].checked = !checked;
          });
        }}
      >
        <Checkbox variant="classic" checked={checked} />
      </Table.Cell>

      <TankRowHeaderCell tank={tank} />

      <Table.Cell>
        <Flex
          align="center"
          height="calc(100% + 2 * var(--space-3) - 2px)"
          gap="4"
          pl="2"
          my="-3"
          mr="-3"
        >
          <IconButton
            variant="ghost"
            size="1"
            onClick={() => {
              Playlist.mutate((draft) => {
                draft.list!.splice(index, 1);
              });
            }}
          >
            <MinusCircledIcon />
          </IconButton>

          <Flex
            width="5rem"
            justify="center"
            align="center"
            height="100%"
            style={{ cursor: "grab", backgroundColor: "var(--gray-1)" }}
          >
            <Text color="gray" trim="end">
              <DragHandleDots2Icon />
            </Text>
          </Flex>
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}
