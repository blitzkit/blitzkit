import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface DiscriminatorProps extends ComponentProps<"span"> {
  corner?: `${"bottom" | "top"}-${"left" | "right"}`;
}

/** Small label overlaid on the right edge of a `position: relative` parent */
export function Discriminator({
  className,
  corner = "bottom-right",
  ...props
}: DiscriminatorProps) {
  return (
    <span
      data-corner={corner}
      className={classNames(styles.discriminator, className)}
      {...props}
    />
  );
}
