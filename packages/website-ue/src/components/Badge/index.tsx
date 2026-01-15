import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import "./index.css";

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
  return (
    <div
      className={classNames("badge", className)}
      style={{
        backgroundColor: `var(--${color}-${highContrast ? 12 : 9})`,
        color: `var(--gray-${highContrast ? 1 : 12})`,

        ...style,
      }}
      {...props}
    />
  );
}
