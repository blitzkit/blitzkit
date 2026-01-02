import { Flex } from "@radix-ui/themes";
import { awaitableProvisionDefinitions } from "../core/awaitables/provisionDefinitions";
import { ProvisionButton } from "./ModuleButtons/ProvisionButton";

interface ProvisionsManagerProps {
  provisions: number[];
  selected: number[];
  disabled?: boolean;
  onChange?: (provisions: number[]) => void;
}

const provisionDefinitions = await awaitableProvisionDefinitions;

export function ProvisionsManager({
  provisions,
  selected,
  onChange,
  disabled,
}: ProvisionsManagerProps) {
  return (
    <Flex wrap="wrap" gap="2" justify={{ initial: "center", sm: "start" }}>
      {provisions.map((id) => {
        const isSelected = selected.includes(id);
        const provision = provisionDefinitions.provisions[id];

        if (provision.game_mode_exclusive) return null;

        return (
          <ProvisionButton
            key={id}
            disabled={disabled && !isSelected}
            provision={id}
            selected={isSelected}
            onClick={() => {
              if (!onChange) return;

              const draft = [...selected];

              if (isSelected) {
                draft.splice(draft.indexOf(id), 1);
              } else {
                draft.push(id);
              }

              onChange(draft);
            }}
          />
        );
      })}
    </Flex>
  );
}
