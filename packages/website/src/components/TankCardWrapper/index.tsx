import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface Props extends ComponentProps<"div"> {
  compact?: boolean;
}

export function TankCardWrapper({ className, compact, ...props }: Props) {
  return (
    <div
      className={classNames(styles.wrapper, className)}
      data-compact={compact}
      {...props}
    />
  );
}
