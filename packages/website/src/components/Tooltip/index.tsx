import type { ReactNode } from "react";
import styles from "./index.module.css";

interface Props {
  children: ReactNode;
  tooltip: string;
  side?: "top" | "left";
}

export function Tooltip({ children, tooltip, side = "top" }: Props) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.text} data-side={side}>
        {tooltip}
      </div>
      {children}
    </div>
  );
}
