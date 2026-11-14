import type { ReactNode } from "react";
import { Heading } from "../Heading";
import styles from "./index.module.css";

interface LoadoutSectionProps {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function LoadoutSection({
  title,
  actions,
  children,
}: LoadoutSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <Heading size="4">{title}</Heading>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {children}
    </div>
  );
}
