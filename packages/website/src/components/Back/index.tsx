import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface Props extends ComponentProps<"div"> {}

export function Back({ className, onClick, ...props }: Props) {
  console.log("init");

  return (
    <div
      className={classNames(styles.back, className)}
      onClick={(event) => {
        console.log("back");
        window.history.back();
        onClick?.(event);
      }}
      {...props}
    />
  );
}
