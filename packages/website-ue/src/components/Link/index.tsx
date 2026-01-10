import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface LinkProps extends ComponentProps<"a"> {
  underline?: "always" | "hover" | "never";
}

export function Link({ className, underline = "always", ...props }: LinkProps) {
  return (
    <a
      className={classNames("link", className)}
      {...props}
      data-underline={underline}
    />
  );
}
