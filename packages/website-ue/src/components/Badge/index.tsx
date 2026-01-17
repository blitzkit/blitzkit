import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import { LIGHT_TEXT_COLORS } from "../Button";
import styles from "./index.module.css";

export interface BadgeProps extends ComponentProps<"div"> {
  color?: Color | "accent";
  highContrast?: boolean;
}

export function Badge({
  className,
  style,
  color = "accent",
  highContrast,
  ...props
}: BadgeProps) {
  const lightText = LIGHT_TEXT_COLORS.has(color as Color);

  return (
    <div
      className={classNames(styles.badge, className)}
      style={{
        backgroundColor: `var(--${color}-${highContrast ? 12 : 9})`,
        color: `var(--gray-${highContrast || lightText ? 1 : 12})`,
        ...style,
      }}
      {...props}
    />
  );
}
