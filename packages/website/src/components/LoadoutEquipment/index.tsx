import { alias } from "@blitzkit/core";
import type { EquipmentSlot, TankDefinition } from "@blitzkit/protos";
import { TrashIcon } from "@radix-ui/react-icons";
import { chunk } from "lodash-es";
import type { ReactNode } from "react";
import { api } from "../../api/dynamic";
import { equipmentColumns } from "../../config/equipment";
import { useEquipmentPreset } from "../../hooks/useEquipmentPreset";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { IconButton } from "../IconButton";
import { LoadoutSection } from "../LoadoutSection";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

const equipment = await api.equipment();

interface ContentProps {
  tank: TankDefinition;
  selected: Record<number, number>;
  onToggle: (slotIndex: number, optionIndex: number) => void;
}

function Content({ tank, selected, onToggle }: ContentProps) {
  const preset = useEquipmentPreset(tank.equipment_preset);

  return (
    <div className={styles.equipment}>
      {chunk(preset.slots, equipmentColumns).map((slots, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {slots.map((slot, columnIndex) => (
            <Slot
              key={columnIndex}
              slot={slot}
              slotIndex={rowIndex * equipmentColumns + columnIndex}
              selected={selected}
              onToggle={onToggle}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SlotProps {
  slot: EquipmentSlot;
  slotIndex: number;
  selected: Record<number, number>;
  onToggle: (slotIndex: number, optionIndex: number) => void;
}

function Slot({ slot, slotIndex, selected, onToggle }: SlotProps) {
  const unwrap = useUnwrapper();

  return (
    <div className={styles.slots}>
      <div className={styles.options}>
        {slot.options.map((id, optionIndex) => {
          const isSelected = selected[slotIndex] === optionIndex;
          const name = unwrap(equipment.equipments[id].name);

          return (
            <Tooltip key={id} tooltip={name}>
              <IconButton
                size="major"
                color={isSelected ? undefined : "gray"}
                variant={isSelected ? "surface" : "soft"}
                radius="1"
                parentListChild="horizontal"
                onClick={() => onToggle(slotIndex, optionIndex)}
              >
                <img
                  alt={name}
                  src={alias("api", `/icons/equipment/${id}.webp`)}
                />
              </IconButton>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

interface LoadoutEquipmentProps {
  tank: TankDefinition;
  selected: Record<number, number>;
  onToggle: (slotIndex: number, optionIndex: number) => void;
  onClear: () => void;
  // Extra controls beside the clear button
  actions?: ReactNode;
}

export function LoadoutEquipment({
  tank,
  selected,
  onToggle,
  onClear,
  actions,
}: LoadoutEquipmentProps) {
  const strings = useStrings();

  return (
    <LoadoutSection
      title={strings.tanks.loadout.equipment}
      actions={
        <>
          <IconButton
            color="red"
            variant="ghost"
            size="minor"
            onClick={onClear}
          >
            <TrashIcon />
          </IconButton>

          {actions}
        </>
      }
    >
      <Content tank={tank} selected={selected} onToggle={onToggle} />
    </LoadoutSection>
  );
}
