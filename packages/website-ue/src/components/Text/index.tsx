import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import "./index.css";

export interface TextProps extends ComponentProps<"span"> {
  color?: Color;
  lowContrast?: boolean;
}

export function Text({
  color = "gray",
  lowContrast,
  className,
  ...props
}: TextProps) {
  return (
    <span
      className={classNames("text", className)}
      style={{ color: `var(--${color}-${lowContrast ? 11 : 12})` }}
      {...props}
    />
  );
}
