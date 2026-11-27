import {
  CheckIcon,
  Cross1Icon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useState, type KeyboardEvent } from "react";
import { tierListColors } from "../../config/tierList";
import { useStrings } from "../../hooks/useStrings";
import { TierList, type TierListRowState } from "../../stores/tierList";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { IconButton } from "../IconButton";
import { Popover } from "../Popover";
import { Table } from "../Table";
import { TextField } from "../TextField";
import styles from "./index.module.css";

interface TierListRowHeaderProps {
  index: number;
  row: TierListRowState;
}

export function TierListRowHeader({ index, row }: TierListRowHeaderProps) {
  const strings = useStrings();
  const rowCount = TierList.useDeferred(
    (state) => state.rows.length,
    TierList.initial.rows.length,
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(row.name);
  const [color, setColor] = useState(row.color);

  function apply() {
    TierList.mutate((draft) => {
      draft.rows[index].name = name;
      draft.rows[index].color = color;
    });

    setOpen(false);
  }

  function remove() {
    TierList.mutate((draft) => {
      draft.rows.splice(index, 1);
    });

    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") apply();
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(open) => {
        if (open) {
          setName(row.name);
          setColor(row.color);
        }

        setOpen(open);
      }}
    >
      <Popover.Trigger asChild>
        <Table.Cell className={styles.header} data-accent={row.color}>
          <div className={styles.content}>
            <Heading size="5" weight="bold">
              {row.name}
            </Heading>

            <IconButton variant="solid" color="gray" highContrast size="minor">
              <Pencil2Icon />
            </IconButton>
          </div>
        </Table.Cell>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content>
          <Popover.Field label={strings.tier_list.edit.label}>
            <TextField
              autoFocus="always"
              placeholder={strings.tier_list.edit.placeholder}
              value={name}
              onChange={(event) =>
                setName((event.target as HTMLInputElement).value)
              }
              onKeyDown={handleKeyDown}
            />
          </Popover.Field>

          <Popover.Field label={strings.tier_list.edit.color}>
            <div className={styles.swatches}>
              {tierListColors.map((swatch) => (
                <IconButton
                  key={swatch}
                  color={swatch}
                  size="minor"
                  className={styles.swatch}
                  data-selected={swatch === color}
                  onClick={() => setColor(swatch)}
                >
                  <CheckIcon />
                </IconButton>
              ))}
            </div>
          </Popover.Field>

          <Popover.Actions>
            <Popover.Close asChild>
              <Button variant="outline" color="red">
                <Cross1Icon />
                {strings.tier_list.edit.cancel}
              </Button>
            </Popover.Close>

            <Button
              variant="soft"
              color="red"
              disabled={rowCount === 1}
              onClick={remove}
            >
              <TrashIcon />
              {strings.tier_list.edit.remove}
            </Button>

            <Button onClick={apply}>
              <CheckIcon />
              {strings.tier_list.edit.apply}
            </Button>
          </Popover.Actions>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
