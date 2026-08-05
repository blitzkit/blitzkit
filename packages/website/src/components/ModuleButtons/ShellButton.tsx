import { GenericTankComponentButton } from "./GenericTankComponentButton";
import type { TankComponentButtonProps } from "./TankComponentButton";

interface ShellButtonProps extends TankComponentButtonProps {
  shell: string;
}

export function ShellButton({ shell, ...props }: ShellButtonProps) {
  return (
    <GenericTankComponentButton
      icon={`/api/icons/shells/${shell}.webp`}
      {...props}
    />
  );
}
