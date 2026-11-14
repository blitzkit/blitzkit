import { alias } from "@blitzkit/core";
import type { GunDefinition, TankDefinition } from "@blitzkit/protos";
import { TrashIcon } from "@radix-ui/react-icons";
import { api } from "../../api/dynamic";
import { useStrings } from "../../hooks/useStrings";
import { useTankCompatibility } from "../../hooks/useTankCompatibility";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { IconButton } from "../IconButton";
import { LoadoutSection } from "../LoadoutSection";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

const provisions = await api.provisions();

interface ContentProps {
  tank: TankDefinition;
  gun: GunDefinition;
  selected: number[];
  onToggle: (id: number) => void;
  // Sizes to its content instead of filling the parent
  implicitWidth?: boolean;
}

function Content({
  tank,
  gun,
  selected,
  onToggle,
  implicitWidth,
}: ContentProps) {
  const unwrap = useUnwrapper();
  const isCompatible = useTankCompatibility(tank, gun);

  return (
    <div className={styles.provisions} data-implicit-width={implicitWidth}>
      {Object.values(provisions.provisions).map((provision) => {
        if (
          provision.game_mode_exclusive ||
          !isCompatible(provision.include, provision.exclude)
        ) {
          return null;
        }

        const isSelected = selected.includes(provision.id);
        const disabled = !isSelected && selected.length >= tank.max_provisions;
        const name = unwrap(provision.name);

        return (
          <Tooltip key={provision.id} tooltip={name}>
            <IconButton
              size="major"
              radius="1"
              variant={isSelected ? "surface" : "soft"}
              color={isSelected ? undefined : "gray"}
              disabled={disabled}
              onClick={() => onToggle(provision.id)}
            >
              <img
                src={alias("api", `/icons/provisions/${provision.id}.webp`)}
              />
            </IconButton>
          </Tooltip>
        );
      })}
    </div>
  );
}

interface LoadoutProvisionsProps {
  tank: TankDefinition;
  gun: GunDefinition;
  selected: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
  // Sizes to its content instead of filling the parent
  implicitWidth?: boolean;
}

export function LoadoutProvisions({
  tank,
  gun,
  selected,
  onToggle,
  onClear,
  implicitWidth,
}: LoadoutProvisionsProps) {
  const strings = useStrings();

  return (
    <LoadoutSection
      title={strings.tanks.loadout.provisions}
      actions={
        <IconButton
          color="red"
          variant="ghost"
          size="minor"
          onClick={onClear}
        >
          <TrashIcon />
        </IconButton>
      }
    >
      <Content
        tank={tank}
        gun={gun}
        selected={selected}
        onToggle={onToggle}
        implicitWidth={implicitWidth}
      />
    </LoadoutSection>
  );
}
