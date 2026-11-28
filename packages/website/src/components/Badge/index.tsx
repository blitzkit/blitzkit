import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import type { Color } from "../../ui/color";
import styles from "./index.module.css";

export interface BadgeProps extends ComponentProps<"span"> {
  color?: Color;
  variant?: "solid" | "soft" | "surface" | "outline";
  size?: "minor" | "regular";
}

export function Badge({
  className,
  color,
  variant = "soft",
  size = "minor",
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(styles.badge, className)}
      data-accent={color}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
}
