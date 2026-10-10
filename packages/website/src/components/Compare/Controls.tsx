import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  SegmentedControl,
  Text,
} from "@radix-ui/themes";
import { api } from "../../core/blitzkit/api";
import { tankToCompareMember } from "../../core/blitzkit/tankToCompareMember";
import { useLocale } from "../../hooks/useLocale";
import { CompareEphemeral, syncShellSlot } from "../../stores/compareEphemeral";
import {
  ComparePersistent,
  type DeltaMode,
} from "../../stores/comparePersistent";
import { TankSearch } from "../TankSearch";

interface ControlsProps {
  addTankDialogOpen: boolean;
  onAddTankDialogOpenChange: (open: boolean) => void;
}

const provisionDefinitions = await api.provisionDefinitions();

export function Controls({
  addTankDialogOpen,
  onAddTankDialogOpenChange,
}: ControlsProps) {
  const deltaMode = ComparePersistent.use((state) => state.deltaMode);
  const syncShells = CompareEphemeral.use((state) => state.syncShells);
  const { strings } = useLocale();

  return (
    <Flex gap="2" wrap="wrap" justify="center">
      <Dialog.Root
        open={addTankDialogOpen}
        onOpenChange={onAddTankDialogOpenChange}
      >
        <Dialog.Trigger>
          <Button variant="soft">
            <PlusIcon /> {strings.website.tools.compare.actions.add.button}
          </Button>
        </Dialog.Trigger>

        <Dialog.Content>
          <Dialog.Title align="center">
            {strings.website.tools.compare.actions.add.title}
          </Dialog.Title>
          <Dialog.Description align="center">
            {strings.website.tools.compare.actions.add.description}
          </Dialog.Description>

          <Flex gap="4" direction="column">
            <Flex
              direction="column"
              gap="4"
              style={{ flex: 1 }}
              justify="center"
            >
              <TankSearch
                compact
                onSelect={(tank) => {
                  CompareEphemeral.mutate((draft) => {
                    draft.members.push(
                      tankToCompareMember(tank, provisionDefinitions),
                    );
                    draft.sorting = undefined;
                  });
                  onAddTankDialogOpenChange(false);
                }}
                onSelectAll={(tanks) => {
                  CompareEphemeral.mutate((draft) => {
                    draft.members.push(
                      ...tanks.map((tank) => {
                        return tankToCompareMember(tank, provisionDefinitions);
                      }),
                    );
                    draft.sorting = undefined;
                  });
                  onAddTankDialogOpenChange(false);
                }}
              />
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Button
        variant="soft"
        color="red"
        onClick={() => {
          CompareEphemeral.mutate((draft) => {
            draft.members = [];
            draft.sorting = undefined;
          });
        }}
      >
        <TrashIcon /> {strings.website.tools.compare.actions.clear}
      </Button>

      <SegmentedControl.Root
        variant="classic"
        value={deltaMode}
        onValueChange={(value) => {
          ComparePersistent.mutate((draft) => {
            draft.deltaMode = value as DeltaMode;
          });
        }}
      >
        <SegmentedControl.Item value={"none" satisfies DeltaMode}>
          {strings.website.tools.compare.actions.deltas.none}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={"percentage" satisfies DeltaMode}>
          {strings.website.tools.compare.actions.deltas.percentage}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={"absolute" satisfies DeltaMode}>
          {strings.website.tools.compare.actions.deltas.absolute}
        </SegmentedControl.Item>
      </SegmentedControl.Root>

      <Flex
        align="center"
        gap="2"
        style={{ cursor: "pointer" }}
        onClick={() => {
          CompareEphemeral.mutate((draft) => {
            draft.syncShells = !draft.syncShells;

            if (!draft.syncShells || draft.members.length === 0) return;

            const [first] = draft.members;

            syncShellSlot(
              draft.members,
              first.gun.shells.findIndex(({ id }) => id === first.shell.id),
            );
          });
        }}
      >
        <Checkbox variant="classic" checked={syncShells} />
        <Text size="2">
          {strings.website.tools.compare.actions.sync_shells}
        </Text>
      </Flex>
    </Flex>
  );
}
