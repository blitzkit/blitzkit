import { alias } from "@blitzkit/core";
import { GenericTankComponentButton } from "./GenericTankComponentButton";
import type { TankComponentButtonProps } from "./TankComponentButton";

interface ShellButtonProps extends TankComponentButtonProps {
  shell: string;
}

export function ShellButton({ shell, ...props }: ShellButtonProps) {
  return (
    <GenericTankComponentButton
      icon={alias("api", `/icons/shells/${shell}.webp`)}
      {...props}
    />
  );
}
