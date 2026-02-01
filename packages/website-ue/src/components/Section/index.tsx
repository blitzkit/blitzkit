import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import styles from "./index.module.css";

export interface SectionProps extends ComponentProps<"div"> {
  first?: boolean;
}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <div
      data-first={props.first}
      className={classNames(styles.section, className)}
      {...props}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
}
