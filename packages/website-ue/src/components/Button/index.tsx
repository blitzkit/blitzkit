import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import type { Color } from "../../ui/color";
import styles from "./index.module.css";

export interface ButtonProps extends ComponentProps<"button"> {
  color?: Color;
  radius?: `${1 | 2 | 3}` | "max";
  variant?: "solid" | "surface" | "soft";
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
      data-accent={color}
      data-variant={variant}
      data-light-text={variant === "solid"}
      data-radius={radius}
      {...props}
    />
  );
}
