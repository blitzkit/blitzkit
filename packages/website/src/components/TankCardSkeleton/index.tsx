import { useEffect, useRef } from "react";
import { InlineSkeleton } from "../InlineSkeleton";
import { Skeleton } from "../Skeleton";
import styles from "./index.module.css";

type TankCardProps = {
  compact?: boolean;
  onIntersection?: () => void;
};

export const TankCardSkeleton = ({ compact, onIntersection }: TankCardProps) => {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onIntersection) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onIntersection();
    });

    observer.observe(wrapper.current!);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapper}
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
