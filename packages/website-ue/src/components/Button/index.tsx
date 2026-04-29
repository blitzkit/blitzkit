import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import styles from "./index.module.css";

export interface ButtonProps extends ComponentProps<"button"> {
  color?: Color;
  radius?: `${1 | 2 | 3}` | "max";
  variant?: "solid" | "surface";
}

export const LIGHT_TEXT_COLORS = new Set<Color>([
  "gold",
  "bronze",
  "teal",
  "grass",
  "amber",
  "plum",
  "pink",
  "brown",
  "crimson",
  "jade",
  "blue",
  "tomato",
]);

export function Button({
  className,
  color,
  variant = "solid",
  style,
  radius = "max",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames("composable-radius", styles.button, className)}
      data-color={color}
      data-variant={variant}
      data-light-text={variant === "solid"}
      data-radius={radius}
      style={{
        backgroundColor: color ? `var(--${color}-9)` : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
