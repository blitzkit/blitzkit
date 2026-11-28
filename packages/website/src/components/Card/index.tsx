import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.card, className)} {...props} />;
}
