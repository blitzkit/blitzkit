import type { ReactNode } from "react";
import styles from "./index.module.css";

interface Props {
  children: ReactNode;
}

export function Callout({ children }: Props) {
  return <div className={styles.callout}>{children}</div>;
}
