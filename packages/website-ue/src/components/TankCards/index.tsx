import styles from "./index.module.css";

interface Props {
  children: React.ReactNode;
}

export function TankCards({ children }: Props) {
  return <div className={styles["tank-cards"]}>{children}</div>;
}
