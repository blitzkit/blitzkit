import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

// Stacks the content that follows the header
export function DialogBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.body, className)} {...props} />;
}
