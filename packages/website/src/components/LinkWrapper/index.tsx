import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export interface LinkWrapperProps extends ComponentProps<"a"> {}

export function LinkWrapper({ className, ...props }: LinkWrapperProps) {
  return <a className={classNames(styles.wrapper, className)} {...props} />;
}
