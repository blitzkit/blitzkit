import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Space } from "../../types/space";
import styles from "./index.module.css";

export interface SectionProps extends ComponentProps<"div"> {
  first?: boolean;
  gap?: Space;
}

export function Section({
  className,
  gap = "5",
  children,
  ...props
}: SectionProps) {
  return (
    <div
      data-first={props.first}
      className={classNames(styles.section, className)}
      {...props}
    >
      <div className={styles.content} style={{ gap: `var(--space-${gap})` }}>
        {children}
      </div>
    </div>
  );
}
