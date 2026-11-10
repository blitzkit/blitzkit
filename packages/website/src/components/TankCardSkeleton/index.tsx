import { InlineSkeleton } from "../InlineSkeleton";
import { Skeleton } from "../Skeleton";
import styles from "./index.module.css";

type TankCardProps = {
  compact?: boolean;
};

export const TankCardSkeleton = ({ compact }: TankCardProps) => {
  return (
    <div
      className={styles.wrapper}
      data-compact={compact}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <Skeleton className={styles["image-wrapper"]} />
      <InlineSkeleton className={styles.name} />
    </div>
  );
};
