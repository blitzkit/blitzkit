import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface Props extends ComponentProps<"div"> {
  children: ReactNode;
  tooltip: string;
  side?: "top" | "left";

  // Controls visibility instead of hover when defined
  open?: boolean;
}

export function Tooltip({
  children,
  tooltip,
  side = "top",
  open,
  className,
  ...props
}: Props) {
  return (
    <div
      className={classNames(styles.tooltip, className)}
      data-controlled={open !== undefined}
      {...props}
    >
      <div className={styles.text} data-side={side} data-open={open}>
        {tooltip}
      </div>
      {children}
    </div>
  );
}
