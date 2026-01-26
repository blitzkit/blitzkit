import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface TextProps extends ComponentProps<"span"> {
  weight?: "light" | "regular" | "medium" | "bold" | "black";
  lowContrast?: boolean;
  size?: "regular" | "minor" | "major";
  align?: "left" | "center" | "right";
}

export function Text({
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
      data-low-contrast={lowContrast}
      data-size={size}
      data-weight={weight}
      data-align={align === "left" ? undefined : align}
      {...props}
    />
  );
}
