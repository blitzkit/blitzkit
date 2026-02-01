import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import styles from "./index.module.css";

export interface LinkProps extends ComponentProps<"a"> {
  underline?: "always" | "hover" | "never";
  highContrast?: boolean;
  color?: Color | "accent";
}

export function Link({
  highContrast,
  className,
  underline = "always",
  color = "accent",
  style,
  ...props
}: LinkProps) {
  return (
    <a
      className={classNames(styles.link, className)}
      style={{
        color: `var(--${color}-${highContrast ? 12 : 11})`,
        ...style,
      }}
      {...props}
      data-underline={underline}
      data-high-contrast={highContrast}
    />
  );
}
