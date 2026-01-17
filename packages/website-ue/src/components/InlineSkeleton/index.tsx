import { classNames } from "../../core/ui/classNames";
import { Skeleton, type SkeletonProps } from "../Skeleton";
import "./index.css";

export interface InlineSkeletonProps extends SkeletonProps {}

export function InlineSkeleton({ className, ...props }: InlineSkeletonProps) {
  return (
    <Skeleton className={classNames("inline-skeleton", className)} {...props} />
  );
}
