import type { ReactNode } from "react";
import styles from "./index.module.css";
import { Heading } from "../Heading";

interface Props {
  title: string;
  children: ReactNode;
}

export function TankopediaCollapsible({ children, title }: Props) {
  return (
    <div className={styles.collapsible}>
      <Heading size="2">{title}</Heading>
      {children}
    </div>
  );
}
