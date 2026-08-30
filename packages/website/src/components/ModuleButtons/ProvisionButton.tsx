import { alias } from "@blitzkit/core";
import { api } from "../../blitzkit/api";
import { useLocale } from "../../hooks/useLocale";
import { GenericTankComponentButton } from "./GenericTankComponentButton";
import type { TankComponentButtonProps } from "./TankComponentButton";

interface ProvisionButtonProps extends TankComponentButtonProps {
  provision: number;
}

const provisionDefinitions = await api.provisions();

export function ProvisionButton({ provision, ...props }: ProvisionButtonProps) {
  const { unwrap } = useLocale();

  return (
    <GenericTankComponentButton
      tooltip={unwrap(provisionDefinitions.provisions[provision].name!)}
      icon={alias("api", `/icons/provisions/${provision}.webp`)}
      {...props}
    />
  );
}
