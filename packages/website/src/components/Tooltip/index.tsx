import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface Props extends ComponentProps<"div"> {
  children: ReactNode;
  tooltip: string;
  side?: "top" | "left";
}

export function Tooltip({
  children,
  tooltip,
  side = "top",
  className,
  ...props
}: Props) {
  return (
    <div className={classNames(styles.tooltip, className)} {...props}>
      <div className={styles.text} data-side={side}>
        {tooltip}
      </div>
      {children}
    </div>
  );
}
