import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface ProgressProps extends ComponentProps<"div"> {
  value: number;
}

export function Progress({ value, className, ...props }: ProgressProps) {
  return (
    <div {...props} className={classNames(styles.progress, className)}>
      <div className={styles.bar} style={{ width: `${value}%` }} />
    </div>
  );
}
