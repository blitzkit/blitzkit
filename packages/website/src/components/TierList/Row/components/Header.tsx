import {
  CheckIcon,
  Cross1Icon,
  Pencil1Icon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Popover,
  Table,
  TextField,
} from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { Var } from '../../../../core/radix/var';
import { TierList } from '../../../../stores/tierList';
import { tierListRows } from '../../Table/constants';

interface HeaderProps {
  index: number;
}

export function Header({ index }: HeaderProps) {
  const rowStyle = tierListRows[index];
  const name = TierList.use((state) => state.rows[index].name);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Table.RowHeaderCell
      width="0"
      style={{ backgroundColor: Var(rowStyle.color) }}
    >
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Heading>
            <Flex direction="column" align="center" gap="2">
              {name}

              <IconButton variant="solid" color="gray" highContrast>
                <Pencil2Icon />
              </IconButton>
            </Flex>
          </Heading>
        </Popover.Trigger>

        <Popover.Content>
          <Flex direction="column" gap="2">
            <TextField.Root
              variant="classic"
              placeholder="Tier name"
              ref={input}
              defaultValue={name}
              onKeyDown={(event) => {
                if (!input.current) return;

                if (event.key === 'Enter') {
                  input.current.blur();
                } else if (event.key === 'Escape') {
                  input.current.value = name;
                  input.current.blur();
                }
              }}
              onBlur={() => {
                if (!input.current) return;

                TierList.mutate((draft) => {
                  if (!input.current) return;
                  draft.rows[index].name = input.current.value;
                });

                setOpen(false);
              }}
            >
              <TextField.Slot>
                <Pencil1Icon />
              </TextField.Slot>
            </TextField.Root>

            <Flex gap="1" width="100%">
              <Popover.Close
                onClick={() => {
                  if (!input.current) return;

                  input.current.value = name;
                }}
              >
                <Button variant="outline" color="red" style={{ flex: 1 }}>
                  <Cross1Icon /> Cancel
                </Button>
              </Popover.Close>

              <Button
                style={{ flex: 1 }}
                onClick={() => {
                  if (!input.current) return;

                  input.current.blur();
                }}
              >
                <CheckIcon /> Apply
              </Button>
            </Flex>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Table.RowHeaderCell>
  );
}
