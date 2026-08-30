import { alias } from "@blitzkit/core";
import { api } from "../../blitzkit/api";
import { useLocale } from "../../hooks/useLocale";
import { GenericTankComponentButton } from "./GenericTankComponentButton";
import type { TankComponentButtonProps } from "./TankComponentButton";

interface EquipmentButtonProps extends TankComponentButtonProps {
  equipment: number;
}

const equipmentDefinitions = await api.equipment();

export function EquipmentButton({ equipment, ...props }: EquipmentButtonProps) {
  const { unwrap } = useLocale();

  return (
    <GenericTankComponentButton
      tooltip={unwrap(equipmentDefinitions.equipments[equipment].name!)}
      icon={alias("api", `/icons/equipment/${equipment}.webp`)}
      {...props}
    />
  );
}
