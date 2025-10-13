import {
  ChevronUpIcon,
  DoubleArrowDownIcon,
  DoubleArrowUpIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons";
import {
  Button,
  Checkbox,
  ChevronDownIcon,
  Flex,
  IconButton,
  Table,
} from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { Playlist } from "../stores/playlist";
import { TankRowHeaderCell } from "./TankRowHeaderCell";

export function PlaylistOrder() {
  const { strings } = useLocale();
  const list = Playlist.use((state) => state.list);

  if (!list) return null;

  return (
    <Flex direction="column" gap="4" align="center" flexGrow="1" flexBasis="0">
      <Button
        onClick={() => {
          Playlist.mutate((draft) => {
            draft.list = undefined;
          });
        }}
      >
        {strings.website.tools.playlist.clear}
      </Button>

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell />
            <Table.ColumnHeaderCell>
              {strings.website.tools.playlist.table.tank}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {list.map(({ tank, checked }, index) => (
            <Table.Row key={tank.id}>
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
                <Flex align="center" height="100%" px="2" mb="-1">
                  <IconButton
                    variant="soft"
                    size="1"
                    onClick={() => {
                      Playlist.mutate((draft) => {
                        draft.list!.splice(index, 1);
                      });
                    }}
                    style={{
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  >
                    <MinusCircledIcon />
                  </IconButton>

                  <IconButton
                    radius="none"
                    disabled={index === list.length - 1}
                    variant="soft"
                    size="1"
                    color="gray"
                    highContrast
                    onClick={() => {
                      const item = list[index];
                      Playlist.mutate((draft) => {
                        draft.list!.splice(index, 1);
                        draft.list!.push(item);
                      });
                    }}
                  >
                    <DoubleArrowDownIcon />
                  </IconButton>

                  <IconButton
                    radius="none"
                    disabled={index === 0}
                    variant="soft"
                    size="1"
                    color="gray"
                    onClick={() => {
                      const item = list[index];
                      Playlist.mutate((draft) => {
                        draft.list!.splice(index, 1);
                        draft.list!.unshift(item);
                      });
                    }}
                  >
                    <DoubleArrowUpIcon />
                  </IconButton>

                  <IconButton
                    radius="none"
                    disabled={index === list.length - 1}
                    variant="soft"
                    size="1"
                    color="gray"
                    highContrast
                    onClick={() => {
                      const item = list[index];
                      Playlist.mutate((draft) => {
                        const newIndex = index + 1;
                        draft.list!.splice(index, 1);
                        draft.list!.splice(newIndex, 0, item);
                      });
                    }}
                  >
                    <ChevronDownIcon />
                  </IconButton>

                  <IconButton
                    disabled={index === 0}
                    variant="soft"
                    size="1"
                    color="gray"
                    highContrast
                    onClick={() => {
                      const item = list[index];
                      Playlist.mutate((draft) => {
                        const newIndex = index - 1;
                        draft.list!.splice(index, 1);
                        draft.list!.splice(newIndex, 0, item);
                      });
                    }}
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}
                  >
                    <ChevronUpIcon />
                  </IconButton>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}
