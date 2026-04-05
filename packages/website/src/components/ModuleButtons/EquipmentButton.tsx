import { asset } from "@blitzkit/core";
import { awaitableEquipmentDefinitions } from "../../core/awaitables/equipmentDefinitions";
import { useLocale } from "../../hooks/useLocale";
import { GenericTankComponentButton } from "./GenericTankComponentButton";
import type { TankComponentButtonProps } from "./TankComponentButton";

interface EquipmentButtonProps extends TankComponentButtonProps {
  equipment: number;
}

const equipmentDefinitions = await awaitableEquipmentDefinitions;

export function EquipmentButton({ equipment, ...props }: EquipmentButtonProps) {
  const { unwrap } = useLocale();

  return (
    <GenericTankComponentButton
      tooltip={unwrap(equipmentDefinitions.equipments[equipment].name!)}
      icon={asset(`icons/equipment/${equipment}.webp`)}
      {...props}
    />
  );
}
