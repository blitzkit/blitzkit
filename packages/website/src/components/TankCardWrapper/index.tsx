import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export function TankCardWrapper({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={classNames(styles.wrapper, className)} {...props} />;
}
