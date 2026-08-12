import { alias } from "@blitzkit/core";
import { GenericTankComponentButton } from "./GenericTankComponentButton";
import type { TankComponentButtonProps } from "./TankComponentButton";

interface ModuleProps extends TankComponentButtonProps {
  module: string;
}

export function ModuleButton({ module, ...props }: ModuleProps) {
  return (
    <GenericTankComponentButton
      icon={alias("api", `/icons/modules/${module}.webp`)}
      iconStyles={{
        top: "50%",
        left: "50%",
        transform: "translate(calc(-50% + 2px), calc(-50% + 2px))",
      }}
      {...props}
    />
  );
}
