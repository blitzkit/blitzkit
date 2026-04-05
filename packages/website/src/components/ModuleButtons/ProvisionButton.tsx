import { asset } from "@blitzkit/core";
import { awaitableProvisionDefinitions } from "../../core/awaitables/provisionDefinitions";
import { useLocale } from "../../hooks/useLocale";
import { GenericTankComponentButton } from "./GenericTankComponentButton";
import type { TankComponentButtonProps } from "./TankComponentButton";

interface ProvisionButtonProps extends TankComponentButtonProps {
  provision: number;
}

const provisionDefinitions = await awaitableProvisionDefinitions;

export function ProvisionButton({ provision, ...props }: ProvisionButtonProps) {
  const { unwrap } = useLocale();

  return (
    <GenericTankComponentButton
      tooltip={unwrap(provisionDefinitions.provisions[provision].name!)}
      icon={asset(`icons/provisions/${provision}.webp`)}
      {...props}
    />
  );
}
