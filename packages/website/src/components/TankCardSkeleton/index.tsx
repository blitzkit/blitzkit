import { memo, useRef } from "react";
import { useIntersection } from "../../hooks/useIntersection";
import { Flex } from "../Flex";
import { Skeleton } from "../Skeleton";
import styles from "./index.module.css";

interface SkeletonTankCardProps {
  onIntersection?: () => void;
}

export const TankCardSkeleton = memo(
  ({ onIntersection }: SkeletonTankCardProps) => {
    const card = useRef<HTMLDivElement>(null!);

    useIntersection(() => onIntersection?.(), card, {
      disabled: onIntersection === undefined,
    });

    return (
      <Flex column gap="2" ref={card}>
        <Skeleton className={styles.icon} />
        <Skeleton className={styles.name} />
      </Flex>
    );
  },
  () => true,
);
