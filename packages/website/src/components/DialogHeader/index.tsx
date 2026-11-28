import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

// Groups a title and description
export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.header, className)} {...props} />;
}
