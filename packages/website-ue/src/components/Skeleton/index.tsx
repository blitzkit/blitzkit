import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import styles from "./index.module.css";

export interface SkeletonProps extends ComponentProps<"div"> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={classNames(styles.skeleton, className)} {...props} />;
}
