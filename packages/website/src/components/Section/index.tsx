import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export interface SectionProps extends ComponentProps<"section"> {
  overflow?: boolean;
}

// TODO: reevaluate the usefulness of this as it seems to do very little
export function Section({ className, overflow, ...props }: SectionProps) {
  return (
    <section
      className={classNames(styles.section, className)}
      data-overflow={overflow || undefined}
      {...props}
    />
  );
}
