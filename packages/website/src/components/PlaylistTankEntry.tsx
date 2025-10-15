import {
  MinusCircledIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@radix-ui/react-icons";
import { Checkbox, Flex, IconButton, Table, Text } from "@radix-ui/themes";
import { memo } from "react";
import { awaitableTankDefinitions } from "../core/awaitables/tankDefinitions";
import { useLocale } from "../hooks/useLocale";
import { Playlist, type PlaylistEntry } from "../stores/playlist";
import { TankRowHeaderCell } from "./TankRowHeaderCell";

interface Props extends PlaylistEntry {
  index: number;
}

const tankDefinitions = await awaitableTankDefinitions;

export const PlaylistTankEntry = memo<Props>(
  ({ id, checked, then, now, index }) => {
    const { locale, strings } = useLocale();
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const dateNow = Date.now();
    const tank = tankDefinitions.tanks[id];

    return (
      <Table.Row>
        <Table.Cell>{index + 1}</Table.Cell>

        <Table.Cell
          onClick={() => {
            Playlist.mutate((draft) => {
              draft.list![index].checked = !checked;
            });
          }}
        >
          <Checkbox
            variant="classic"
            checked={
              (checked === undefined &&
                now &&
                then &&
                now.battles > then.battles) ||
              checked
            }
          />
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

        <TankRowHeaderCell tank={tank} />

        <Table.Cell>
          {now && then && now.battles !== then.battles ? (
            <Flex gap="2">
              <Text color="green">
                <Flex align="center">
                  <TriangleUpIcon />
                  {now.wins - then.wins}
                </Flex>
              </Text>

              <Text color="tomato">
                <Flex align="center">
                  <TriangleDownIcon />
                  {now.battles - then.battles - now.wins + then.wins}
                </Flex>
              </Text>
            </Flex>
          ) : (
            strings.website.tools.playlist.table.unrecorded
          )}
        </Table.Cell>

        <Table.Cell>
          {now?.battles ?? strings.website.tools.playlist.table.unrecorded}
        </Table.Cell>

        <Table.Cell>
          {now && now.last !== 0
            ? rtf.format(
                Math.ceil((now.last - dateNow / 1000) / (60 * 60 * 24)),
                "day"
              )
            : strings.website.tools.playlist.table.unrecorded}
        </Table.Cell>
      </Table.Row>
    );
  },
  (a, b) =>
    a.checked === b.checked &&
    a.then?.battles === b.then?.battles &&
    a.index === b.index
);
