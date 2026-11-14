import { TrashIcon } from "@radix-ui/react-icons";
import { useStrings } from "../../hooks/useStrings";
import {
  vehicleStatusKeys,
  type VehicleStatusKey,
} from "../../tankopedia/tankState";
import { IconButton } from "../IconButton";
import { LoadoutSection } from "../LoadoutSection";
import styles from "./index.module.css";

interface LoadoutStatusProps {
  status: Record<VehicleStatusKey, boolean>;
  onToggle: (key: VehicleStatusKey) => void;
  onClear: () => void;
}

export function LoadoutStatus({
  status,
  onToggle,
  onClear,
}: LoadoutStatusProps) {
  const strings = useStrings();

  return (
    <LoadoutSection
      title={strings.tanks.loadout.status}
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
      <div className={styles.status}>
        {vehicleStatusKeys.map((group, index) => (
          <div key={index} className={styles.group}>
            {group.map((key) => (
              <IconButton
                key={key}
                aria-pressed={status[key]}
                radius="1"
                className={styles.state}
                color={status[key] ? "amber" : "gray"}
                variant={status[key] ? "surface" : "soft"}
                onClick={() => onToggle(key)}
              >
                <img src={`/media/status/${key}.png`} />
              </IconButton>
            ))}
          </div>
        ))}
      </div>
    </LoadoutSection>
  );
}
