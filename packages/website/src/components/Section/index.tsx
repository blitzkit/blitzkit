import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export interface SectionProps extends ComponentProps<"div"> {}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <div className={classNames(styles.section, className)} {...props}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
