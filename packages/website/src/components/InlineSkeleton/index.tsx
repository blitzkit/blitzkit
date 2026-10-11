import { classNames } from "../../ui/classNames";
import { Skeleton, type SkeletonProps } from "../Skeleton";
import styles from "./index.module.css";

export function InlineSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={classNames(styles["inline-skeleton"], className)}
      {...props}
    />
  );
}
