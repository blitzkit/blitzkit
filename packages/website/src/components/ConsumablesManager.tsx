import type { Consumable } from "@blitzkit/core";
import { Flex, type FlexProps } from "@radix-ui/themes";
import { ConsumableButton } from "./ModuleButtons/ConsumableButton";

type ConsumablesManagerProps = FlexProps & {
  consumables: Consumable[];
  selected: number[];
  onConsumablesChange?: (consumables: number[]) => void;
  disabled?: boolean;
  timers?: boolean;
  hasHighEndConsumables?: boolean;
  hasConsumableDeliverySystem?: boolean;
  cooldownBooster?: number;
};

export function ConsumablesManager({
  consumables,
  selected,
  onConsumablesChange,
  disabled,
  timers,
  hasConsumableDeliverySystem,
  cooldownBooster,
  hasHighEndConsumables,
  ...props
}: ConsumablesManagerProps) {
  return (
    <Flex wrap="wrap" gap="2" {...props}>
      {consumables.map((consumable) => {
        if (consumable.game_mode_exclusive) return null;

        const isSelected = selected.some((id) => id === consumable.id);

        return (
          <ConsumableButton
            special={consumable.duration === undefined}
            duration={
              timers
                ? consumable.duration === undefined
                  ? undefined
                  : consumable.duration * (hasHighEndConsumables ? 1.33 : 1)
                : undefined
            }
            cooldown={
              timers
                ? consumable.cooldown *
                  (hasConsumableDeliverySystem ? 0.88 : 1) *
                  (1 - cooldownBooster! * 0.1)
                : undefined
            }
            key={consumable.id}
            disabled={disabled && !isSelected}
            consumable={consumable.id}
            selected={isSelected}
            onClick={() => {
              if (!onConsumablesChange) return;

              const draft = [...selected];

              if (draft.some((id) => id === consumable.id)) {
                draft.splice(draft.indexOf(consumable.id), 1);
              } else {
                draft.push(consumable.id);
              }

              onConsumablesChange(draft);
            }}
          />
        );
      })}
    </Flex>
  );
}
