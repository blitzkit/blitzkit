import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import styles from "./index.module.css";

export interface CodeProps extends ComponentProps<"code"> {
  variant?: "ghost" | "solid";
}

export function Code({ className, variant = "ghost", ...props }: CodeProps) {
  return (
    <code
      data-variant={variant}
      className={classNames(styles.code, className)}
      {...props}
    />
  );
}
