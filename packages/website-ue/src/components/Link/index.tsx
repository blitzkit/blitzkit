import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface LinkProps extends ComponentProps<"a"> {
  underline?: "always" | "hover" | "never";
  highContrast?: boolean;
}

export function Link({
  highContrast,
  className,
  underline = "always",
  ...props
}: LinkProps) {
  return (
    <a
      className={classNames("link", className)}
      {...props}
      data-underline={underline}
      data-high-contrast={highContrast}
    />
  );
}
