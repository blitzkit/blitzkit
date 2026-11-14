import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface DiscriminatorProps extends ComponentProps<"span"> {
  corner?: `${"bottom" | "top"}-${"left" | "right"}`;
  inset?: "small" | "regular";
}

/** Small label overlaid on the right edge of a `position: relative` parent */
export function Discriminator({
  className,
  corner = "bottom-right",
  inset = "regular",
  ...props
}: DiscriminatorProps) {
  return (
    <span
      data-inset={inset}
      data-corner={corner}
      className={classNames(styles.discriminator, className)}
      {...props}
    />
  );
}
