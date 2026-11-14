import locales from "@blitzkit/i18n/locales.json";
import { ExternalLinkIcon, LoopIcon, TrashIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";
import { tankToCompareMember } from "../../core/blitzkit/tankToCompareMember";
import { useLocale } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { CompareEphemeral } from "../../stores/compareEphemeral";
import { Dialog } from "../Dialog";
import { IconButton } from "../IconButton";
import { TankSearch } from "../TankSearch";
import styles from "./index.module.css";

interface CompareTankControlProps {
  index: number;
  slug: string;
}

export function CompareTankControl({ index, slug }: CompareTankControlProps) {
  const locale = useLocale();
  const strings = useStrings();
  const [swapping, setSwapping] = useState(false);

  const handleRemove = useCallback(() => {
    CompareEphemeral.mutate((draft) => {
      draft.members.splice(index, 1);
      draft.sorting.by = null;
    });
  }, [index]);

  return (
    <div className={styles.controls}>
      <IconButton variant="ghost" size="minor" onClick={handleRemove}>
        <TrashIcon />
      </IconButton>

      <Dialog.Root open={swapping} onOpenChange={setSwapping}>
        <Dialog.Trigger asChild>
          <IconButton variant="ghost" size="minor">
            <LoopIcon />
          </IconButton>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{strings.compare.swap_dialog.title}</Dialog.Title>
              <Dialog.Description>
                {strings.compare.swap_dialog.description}
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Body>
              <TankSearch
                compact
                onSelect={(tank) => {
                  CompareEphemeral.mutate((draft) => {
                    draft.members[index] = tankToCompareMember(tank);
                    draft.sorting.by = null;
                  });
                  setSwapping(false);
                }}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <IconButton
        variant="ghost"
        size="minor"
        onClick={() => {
          const prefix = locale === locales.default ? "" : `/${locale}`;
          window.open(`${prefix}/tanks/${slug}`, "_blank");
        }}
      >
        <ExternalLinkIcon />
      </IconButton>
    </div>
  );
}
