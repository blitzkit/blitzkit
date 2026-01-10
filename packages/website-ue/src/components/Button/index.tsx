import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import "./index.css";

export interface ButtonProps extends ComponentProps<"button"> {
  color?: Color;
  variant?: "solid";
}

const LIGHT_TEXT_COLORS = new Set<Color>([
  "purple",
  "gold",
  "bronze",
  "teal",
  "grass",
]);

export function Button({
  className,
  color,
  variant = "solid",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames("button", className)}
      data-color={color}
      data-variant={variant}
      data-light-text={color ? LIGHT_TEXT_COLORS.has(color) : undefined}
      style={{
        backgroundColor: color ? `var(--${color}-9)` : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
