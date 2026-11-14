import { alias } from "@blitzkit/core";
import type { GunDefinition } from "@blitzkit/protos";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { IconButton } from "../IconButton";
import { LoadoutSection } from "../LoadoutSection";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

interface LoadoutShellsProps {
  gun: GunDefinition;
  selected: number;
  onSelect: (id: number) => void;
}

export function LoadoutShells({ gun, selected, onSelect }: LoadoutShellsProps) {
  const strings = useStrings();
  const unwrap = useUnwrapper();

  return (
    <LoadoutSection title={strings.tanks.loadout.shells}>
      <div className={styles.shells}>
        {gun.shells.map((candidate) => {
          const isSelected = candidate.id === selected;
          const name = unwrap(candidate.name!);

          return (
            <Tooltip key={candidate.id} tooltip={name}>
              <IconButton
                size="major"
                radius="1"
                color={isSelected ? undefined : "gray"}
                variant={isSelected ? "surface" : "soft"}
                parentListChild="horizontal"
                onClick={() => onSelect(candidate.id)}
              >
                <img
                  alt={name}
                  src={alias("api", `/icons/shells/${candidate.icon}.webp`)}
                />
              </IconButton>
            </Tooltip>
          );
        })}
      </div>
    </LoadoutSection>
  );
}
