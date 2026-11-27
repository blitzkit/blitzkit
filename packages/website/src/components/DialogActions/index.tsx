import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

// The row of buttons that closes things out
export function DialogActions({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.actions, className)} {...props} />;
}
