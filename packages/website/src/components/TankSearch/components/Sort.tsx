import { CaretDownIcon } from "@radix-ui/react-icons";
import { characteristicsGroups } from "../../../config/characteristicsGroups";
import { useStrings } from "../../../hooks/useStrings";
import { TankopediaSortDirection } from "../../../stores/tankopediaPersistent";
import { TankSort } from "../../../stores/tankopediaSort";
import { sortableCharacteristics } from "../../../tankopedia/sortableCharacteristics";
import type { CharacteristicName } from "../../../types/characteristics";
import { Button } from "../../Button";
import { DropdownMenu } from "../../DropdownMenu";

interface ItemProps {
  by: CharacteristicName;
}

function Item({ by }: ItemProps) {
  const strings = useStrings();
  const selectedBy = TankSort.use((state) => state.by);

  return (
    <DropdownMenu.CheckboxItem
      checked={selectedBy === by}
      onClick={() => {
        TankSort.mutate((draft) => {
          draft.by = by;
        });
      }}
    >
      {strings.tanks.characteristics.items[by]}
    </DropdownMenu.CheckboxItem>
  );
}

export function Sort() {
  const by = TankSort.use((state) => state.by);
  const direction = TankSort.use((state) => state.direction);
  const strings = useStrings();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="surface" color="gray">
          {strings.website.common.tank_search.sort.label}
          <CaretDownIcon />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>
          {strings.website.common.tank_search.sort.direction.label}
        </DropdownMenu.Label>

        <DropdownMenu.CheckboxItem
          checked={by === null || !sortableCharacteristics.has(by)}
          onClick={() => {
            TankSort.mutate((draft) => {
              draft.by = null;
            });
          }}
        >
          {strings.website.common.tank_search.sort.none}
        </DropdownMenu.CheckboxItem>

        {characteristicsGroups.map((group) => {
          const items = group.order.filter(
            (item) => "name" in item && sortableCharacteristics.has(item.name),
          );

          return (
            <DropdownMenu.Sub key={group.name}>
              <DropdownMenu.SubTrigger>
                {
                  (
                    strings.tanks.characteristics.titles as Record<
                      string,
                      string
                    >
                  )[group.name]
                }
              </DropdownMenu.SubTrigger>

              <DropdownMenu.SubContent>
                {items.map((item) => {
                  if (!("name" in item)) return null;

                  return <Item key={item.name} by={item.name} />;
                })}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          );
        })}

        <DropdownMenu.Label>
          {strings.website.common.tank_search.sort.direction.label}
        </DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={direction}
          onValueChange={(value) => {
            if (
              value !== TankopediaSortDirection.Ascending &&
              value !== TankopediaSortDirection.Descending
            ) {
              throw new Error(`Unknown tankopedia sort direction: ${value}`);
            }

            TankSort.mutate((draft) => {
              draft.direction = value;
            });
          }}
        >
          <DropdownMenu.RadioItem value={TankopediaSortDirection.Ascending}>
            {strings.website.common.tank_search.sort.direction.ascending}
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value={TankopediaSortDirection.Descending}>
            {strings.website.common.tank_search.sort.direction.descending}
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
