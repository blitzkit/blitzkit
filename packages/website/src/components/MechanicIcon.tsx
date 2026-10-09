import { alias } from "@blitzkit/core";
import type { TankMechanic } from "@blitzkit/core/src/blitzkit/tankMechanics";

interface MechanicIconProps {
  mechanic: TankMechanic;
  size?: string;
}

export function MechanicIcon({ mechanic, size = "1.25em" }: MechanicIconProps) {
  const url = `url(${alias("api", `/icons/mechanics/${mechanic}.webp`)})`;

  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: "currentColor",
        mask: `${url} center / contain no-repeat`,
        WebkitMask: `${url} center / contain no-repeat`,
      }}
    />
  );
}
