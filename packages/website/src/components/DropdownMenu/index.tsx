import { DropdownMenu as _ } from "radix-ui";
import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import { composeRadixComponents } from "../../ui/compose";
import styles from "./index.module.css";

// Trailing text pushed to the right of an item, like flags or shortcuts
export function Discriminator({ className, ...props }: ComponentProps<"span">) {
  return (
    <span className={classNames(styles.discriminator, className)} {...props} />
  );
}

export const DropdownMenu = {
  ...composeRadixComponents(_, styles),
  Discriminator,
};
