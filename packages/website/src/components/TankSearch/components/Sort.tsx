import { useStore } from '@nanostores/react';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { useLocale } from '../../../hooks/useLocale';
import type {
  TankopediaSortBy,
  TankopediaSortDirection,
} from '../../../stores/tankopediaPersistent';
import { $tankopediaSort } from '../../../stores/tankopediaSort';

interface ItemProps {
  by: TankopediaSortBy;
}

interface ItemProps {
  by: TankopediaSortBy;
}

function Item({ by }: ItemProps) {
  const { strings } = useLocale();
  const tankopediaSort = useStore($tankopediaSort);

  return (
    <DropdownMenu.CheckboxItem
      checked={tankopediaSort.by === by}
      onClick={() => {
        $tankopediaSort.setKey('by', by);
      }}
    >
      {strings.website.common.tank_search.sort[by]}
    </DropdownMenu.CheckboxItem>
  );
}

export function Sort() {
  const tankopediaSort = useStore($tankopediaSort);
  const { strings } = useLocale();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="surface" color="gray">
          {strings.website.common.tank_search.sort_dropdown.label}
          <CaretDownIcon />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>
          {strings.website.common.tank_search.sort_dropdown.groups.sort.label}
        </DropdownMenu.Label>

        <Item by="meta.none" />

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            {strings.website.common.tank_search.sort_dropdown.groups.sort.fire}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <Item by="fire.dpm" />
            <Item by="fire.dpmPremium" />
            <Item by="fire.reload" />
            <Item by="fire.caliber" />
            <Item by="fire.standardPenetration" />
            <Item by="fire.premiumPenetration" />
            <Item by="fire.tertiaryPenetration" />
            <Item by="fire.damage" />
            <Item by="fire.moduleDamage" />
            <Item by="fire.shellVelocity" />
            <Item by="fire.shellRange" />
            <Item by="fire.shellCapacity" />
            <Item by="fire.aimTime" />
            <Item by="fire.dispersionStill" />
            <Item by="fire.dispersionMoving" />
            <Item by="fire.gunDepression" />
            <Item by="fire.gunElevation" />
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            {
              strings.website.common.tank_search.sort_dropdown.groups.sort
                .maneuverability
            }
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <Item by="maneuverability.forwardsSpeed" />
            <Item by="maneuverability.backwardsSpeed" />
            <Item by="maneuverability.power" />
            <Item by="maneuverability.powerToWeight" />
            <Item by="maneuverability.weight" />
            <Item by="maneuverability.traverseSpeed" />
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            {
              strings.website.common.tank_search.sort_dropdown.groups.sort
                .survivability
            }
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <Item by="survivability.health" />
            <Item by="survivability.viewRange" />
            <Item by="survivability.camouflageStill" />
            <Item by="survivability.camouflageMoving" />
            <Item by="survivability.camouflageShooting" />
            <Item by="survivability.volume" />
            <Item by="survivability.length" />
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Label>
          {
            strings.website.common.tank_search.sort_dropdown.groups.direction
              .label
          }
        </DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={tankopediaSort.direction}
          onValueChange={(value) => {
            $tankopediaSort.setKey(
              'direction',
              value as TankopediaSortDirection,
            );
          }}
        >
          <DropdownMenu.RadioItem value="ascending">
            {
              strings.website.common.tank_search.sort_dropdown.groups.direction
                .ascending
            }
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="descending">
            {
              strings.website.common.tank_search.sort_dropdown.groups.direction
                .descending
            }
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
