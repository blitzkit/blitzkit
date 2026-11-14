import { Heading } from "../Heading";
import { Text } from "../Text";
import styles from "./index.module.css";

interface EmptyStateProps {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className={styles["empty-state"]}>
      <Heading size="4">{title}</Heading>
      <Text lowContrast>{body}</Text>
    </div>
  );
}
