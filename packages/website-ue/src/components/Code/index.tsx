import type { ComponentProps } from "react";
import { classNames } from "../../core/react/classNames";
import "./index.css";

export interface CodeProps extends ComponentProps<"code"> {}

export function Code({ className, ...props }: CodeProps) {
  return <code className={classNames("code", className)} {...props} />;
}
