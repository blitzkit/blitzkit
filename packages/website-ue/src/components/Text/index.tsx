import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import "./index.css";

export interface TextProps extends ComponentProps<"span"> {
  color?: Color;
  weight?: "light" | "regular" | "medium" | "bold" | "black";
  lowContrast?: boolean;
  size?: "regular" | "minor" | "major";
  align?: "left" | "center" | "right";
}

export function Text({
  color = "gray",
  lowContrast,
  className,
  size = "regular",
  weight,
  style,
  align,
  ...props
}: TextProps) {
  return (
    <span
      className={classNames("text", className)}
      style={{ color: `var(--${color}-${lowContrast ? 11 : 12})`, ...style }}
      data-size={size}
      data-weight={weight}
      data-align={align === "left" ? undefined : align}
      {...props}
    />
  );
}
