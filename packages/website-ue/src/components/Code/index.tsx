import type { ComponentProps } from "react";
import "./index.css";

export interface CodeProps extends ComponentProps<"code"> {}

export function Code({ className }: CodeProps) {
  return <code className={className?????} {...props} />;
}
