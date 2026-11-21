import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export interface SectionProps extends ComponentProps<"div"> {}

// TODO: reevaluate the usefulness of this as it seems to do very little
export function Section({ className, children, ...props }: SectionProps) {
  return (
    <div className={classNames(styles.section, className)} {...props}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
