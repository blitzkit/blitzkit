import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import styles from "./index.module.css";

export interface CodeProps extends ComponentProps<"code"> {}

export function Code({ className, ...props }: CodeProps) {
  return <code className={classNames(styles.code, className)} {...props} />;
}
