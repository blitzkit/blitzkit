import { alias } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import type { GunDefinition, TankDefinition } from "@blitzkit/protos";
import { ClockIcon, ResetIcon, TrashIcon } from "@radix-ui/react-icons";
import { api } from "../../api/dynamic";
import { useStrings } from "../../hooks/useStrings";
import { useTankCompatibility } from "../../hooks/useTankCompatibility";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { LoadoutSection } from "../LoadoutSection";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

const [consumables, scripts] = await Promise.all([
  api.consumables(),
  api.scripts(),
]);

interface ContentProps {
  tank: TankDefinition;
  gun: GunDefinition;
  selected: number[];
  onToggle: (id: number) => void;
}

function Content({ tank, gun, selected, onToggle }: ContentProps) {
  const strings = useStrings();
  const unwrap = useUnwrapper();
  const isCompatible = useTankCompatibility(tank, gun);

  return (
    <div className={styles.consumables}>
      {Object.values(consumables.consumables).map((consumable) => {
        if (
          consumable.game_mode_exclusive ||
          !isCompatible(consumable.include, consumable.exclude)
        ) {
          return null;
        }

        const isSelected = selected.includes(consumable.id);
        const disabled = !isSelected && selected.length >= tank.max_consumables;
        const name = unwrap(consumable.name);
        const { duration = 0, cooldown = 0 } =
          scripts.consumables[consumable.id] ?? {};

        return (
          <div key={consumable.id} className={styles.wrapper}>
            <Tooltip tooltip={name} className={styles.tooltip}>
              <Button
                radius="1"
                variant={isSelected ? "surface" : "soft"}
                color={isSelected ? undefined : "gray"}
                className={styles.consumable}
                disabled={disabled}
                onClick={() => onToggle(consumable.id)}
              >
                <img
                  src={alias("api", `/icons/consumables/${consumable.id}.webp`)}
                />
                <div className={styles.info}>
                  {duration > 0 && (
                    <Text lowContrast size="minor">
                      <div className={styles.entry}>
                        <ClockIcon />
                        {literals(strings.units.s, {
                          value: duration,
                        })}
                      </div>
                    </Text>
                  )}

                  {cooldown > 0 && (
                    <Text lowContrast size="minor">
                      <div className={styles.entry}>
                        <ResetIcon />
                        {literals(strings.units.s, {
                          value: cooldown,
                        })}
                      </div>
                    </Text>
                  )}
                </div>
              </Button>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

interface LoadoutConsumablesProps {
  tank: TankDefinition;
  gun: GunDefinition;
  selected: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
}

export function LoadoutConsumables({
  tank,
  gun,
  selected,
  onToggle,
  onClear,
}: LoadoutConsumablesProps) {
  const strings = useStrings();

  return (
    <LoadoutSection
      title={strings.tanks.loadout.consumables}
      actions={
        <IconButton color="red" variant="ghost" size="minor" onClick={onClear}>
          <TrashIcon />
        </IconButton>
      }
    >
      <Content tank={tank} gun={gun} selected={selected} onToggle={onToggle} />
    </LoadoutSection>
  );
}
