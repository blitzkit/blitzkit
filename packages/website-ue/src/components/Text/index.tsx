import type { ComponentProps } from "react";
import type { Color } from "../../core/ui/color";
import "./index.css";

export interface TextProps extends ComponentProps<"span"> {
  color?: Color;
  lowContrast?: boolean;
}

export function Text({ color = "gray", lowContrast, ...props }: TextProps) {
  return (
    <span
      className="text"
      style={{ color: `var(--${color}-${lowContrast ? 11 : 12})` }}
      {...props}
    />
  );
}
