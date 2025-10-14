import { MinusCircledIcon } from "@radix-ui/react-icons";
import { Checkbox, IconButton, Table } from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { Playlist, type PlaylistEntry } from "../stores/playlist";
import { TankRowHeaderCell } from "./TankRowHeaderCell";

interface Props extends PlaylistEntry {
  index: number;
}

export function PlaylistTankEntry({ tank, checked, last, index }: Props) {
  const { locale, strings } = useLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const nowDays = Date.now() / (1000 * 60 * 60 * 24);
  const lastDays = last ? last / (60 * 60 * 24) : undefined;

  return (
    <Table.Row>
      <Table.Cell>{index + 1}</Table.Cell>

      <TankRowHeaderCell tank={tank} />

      <Table.Cell>
        {lastDays
          ? rtf.format(Math.floor(lastDays - nowDays), "day")
          : strings.website.tools.playlist.table.never}
      </Table.Cell>

      <Table.Cell
        onClick={() => {
          Playlist.mutate((draft) => {
            draft.list![index].checked = !checked;
          });
        }}
      >
        <Checkbox variant="classic" checked={checked} />
      </Table.Cell>

      <Table.Cell>
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
      </Table.Cell>
    </Table.Row>
  );
}
