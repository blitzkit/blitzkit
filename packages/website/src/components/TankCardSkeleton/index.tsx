import { Flex } from "../Flex";
import { InlineSkeleton } from "../InlineSkeleton";
import { Skeleton } from "../Skeleton";
import styles from "./index.module.css";

type TankCardProps = {
  compact?: boolean;
};

export const TankCardSkeleton = ({ compact }: TankCardProps) => {
  return (
    <Flex className={styles.wrapper} data-compact={compact} column gap="3">
      <Skeleton className={styles["image-wrapper"]} />
      <InlineSkeleton className={styles.name} />
    </Flex>
  );
};
