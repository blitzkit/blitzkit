import type { ComponentProps } from "react";
import type { Space } from "../../types/space";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface Props extends ComponentProps<"div"> {
  gap?: Space;
  column?: boolean;
}

export function Flex({ children, column, className, gap, ...props }: Props) {
  return (
    <div
      {...props}
      className={classNames(styles.flex, className)}
      data-gap={gap}
      data-column={column}
    >
      {children}
    </div>
  );
}
