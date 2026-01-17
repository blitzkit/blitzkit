import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface SkeletonProps extends ComponentProps<"div"> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={classNames("skeleton", className)} {...props} />;
}
