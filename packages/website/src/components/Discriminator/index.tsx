import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

/** Small label overlaid on the right edge of a `position: relative` parent */
export function Discriminator({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span className={classNames(styles.discriminator, className)} {...props} />
  );
}
