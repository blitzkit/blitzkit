import { Button, Flex, Table } from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { Playlist } from "../stores/playlist";
import { PlaylistTankEntry } from "./PlaylistTankEntry";

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
            <PlaylistTankEntry
              key={tank.id}
              tank={tank}
              checked={checked}
              index={index}
            />
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}
