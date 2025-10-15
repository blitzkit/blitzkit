import { Table, Text } from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { Playlist } from "../stores/playlist";
import { PlaylistTankEntry } from "./PlaylistTankEntry";
import { StickyColumnHeaderCell } from "./StickyColumnHeaderCell";
import { StickyTableRoot } from "./StickyTableRoot";

export function PlaylistTable() {
  const { strings } = useLocale();
  const list = Playlist.use((state) => state.list);

  if (!list) return null;

  return (
    <StickyTableRoot
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        borderRadius: 0,
      }}
      variant="surface"
    >
      <Table.Header>
        <Table.Row>
          <StickyColumnHeaderCell width="0">
            <Text color="gray">
              {strings.website.tools.playlist.table.index}
            </Text>
          </StickyColumnHeaderCell>

          <StickyColumnHeaderCell width="0" />

          <StickyColumnHeaderCell width="0" />

          <StickyColumnHeaderCell width="1">
            {strings.website.tools.playlist.table.tank}
          </StickyColumnHeaderCell>

          <StickyColumnHeaderCell width="1">
            {strings.website.tools.playlist.table.wins}
          </StickyColumnHeaderCell>

          <StickyColumnHeaderCell width="1">
            {strings.website.tools.playlist.table.battles}
          </StickyColumnHeaderCell>

          <StickyColumnHeaderCell width="1">
            {strings.website.tools.playlist.table.last_played}
          </StickyColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {list.map((props, index) => (
          <PlaylistTankEntry key={props.id} index={index} {...props} />
        ))}
      </Table.Body>
    </StickyTableRoot>
  );
}
