import { Button, Checkbox, Flex, Table } from "@radix-ui/themes";
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
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {list.map(({ tank }) => (
            <Table.Row>
              <Table.Cell>
                <Checkbox variant="classic" checked={Math.random() > 0.5} />
              </Table.Cell>

              <TankRowHeaderCell tank={tank} />
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}
