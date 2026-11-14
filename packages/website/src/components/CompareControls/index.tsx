import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { tankToCompareMember } from "../../core/blitzkit/tankToCompareMember";
import { useStrings } from "../../hooks/useStrings";
import { CompareEphemeral, syncShellSlot } from "../../stores/compareEphemeral";
import {
  ComparePersistent,
  type DeltaMode,
} from "../../stores/comparePersistent";
import { resolveTankModules } from "../../tankopedia/resolveTankModules";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Dialog } from "../Dialog";
import { SegmentedControl } from "../SegmentedControl";
import { TankSearch } from "../TankSearch";
import styles from "./index.module.css";

export function CompareControls() {
  const strings = useStrings();
  const deltaMode = ComparePersistent.use((state) => state.deltaMode);
  const syncShells = CompareEphemeral.use((state) => state.syncShells);
  const [adding, setAdding] = useState(false);

  const deltaOptions = useMemo<{ value: DeltaMode; label: string }[]>(
    () => [
      { value: "none", label: strings.compare.deltas.none },
      { value: "percentage", label: strings.compare.deltas.percentage },
      { value: "absolute", label: strings.compare.deltas.absolute },
    ],
    [strings],
  );

  return (
    <div className={styles.controls}>
      <div className={styles.group}>
        <Dialog.Root open={adding} onOpenChange={setAdding}>
          <Dialog.Trigger asChild>
            <Button variant="soft">
              <PlusIcon />
              {strings.compare.add.button}
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{strings.compare.add.title}</Dialog.Title>
                <Dialog.Description>
                  {strings.compare.add.description}
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body>
                <TankSearch
                  compact
                  onSelect={(tank) => {
                    CompareEphemeral.mutate((draft) => {
                      draft.members.push(tankToCompareMember(tank));
                      draft.sorting.by = null;
                    });
                    setAdding(false);
                  }}
                  onSelectAll={(tanks) => {
                    CompareEphemeral.mutate((draft) => {
                      draft.members.push(...tanks.map(tankToCompareMember));
                      draft.sorting.by = null;
                    });
                    setAdding(false);
                  }}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Button
          variant="soft"
          color="red"
          onClick={() => {
            CompareEphemeral.mutate((draft) => {
              draft.members = [];
              draft.sorting.by = null;
            });
          }}
        >
          <TrashIcon />
          {strings.compare.clear}
        </Button>
      </div>

      <SegmentedControl
        options={deltaOptions}
        value={deltaMode}
        onValueChange={(value) => {
          ComparePersistent.mutate((draft) => {
            draft.deltaMode = value as DeltaMode;
          });
        }}
      />

      <Checkbox
        checked={syncShells}
        onCheckedChange={(checked) => {
          CompareEphemeral.mutate((draft) => {
            draft.syncShells = checked;

            if (!checked || draft.members.length === 0) return;

            const [first] = draft.members;
            const { gun, shell } = resolveTankModules(first.state);

            syncShellSlot(
              draft.members,
              gun.shells.findIndex(({ id }) => id === shell.id),
            );
          });
        }}
      >
        {strings.compare.sync_shells}
      </Checkbox>
    </div>
  );
}
