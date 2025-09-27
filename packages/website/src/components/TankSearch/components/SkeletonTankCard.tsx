import { Flex, Skeleton } from "@radix-ui/themes";
import { memo, useRef } from "react";
import { useIntersection } from "../../../hooks/useIntersection";

interface SkeletonTankCardProps {
  onIntersection?: () => void;
}

export const SkeletonTankCard = memo(
  ({ onIntersection }: SkeletonTankCardProps) => {
    const card = useRef<HTMLDivElement>(null!);

    useIntersection(() => onIntersection?.(), card, {
      disabled: onIntersection === undefined,
    });

    return (
      <Flex direction="column" gap="2" ref={card}>
        <Skeleton height="5rem" />
        <Skeleton height="1em" />
      </Flex>
    );
  },
  () => true
);
