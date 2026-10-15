import type { ReactNode } from "react";
import styles from "./index.module.css";

interface Props {
  children: ReactNode;
  tooltip: string;
}

export function Tooltip({ children, tooltip }: Props) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.text}>{tooltip}</div>
      {children}
    </div>
  );
}
