import type { ComponentProps } from "react";
import type { Space } from "../../types/space";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

interface Props extends ComponentProps<"div"> {
  column?: boolean;
  wrap?: boolean;

  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between";

  gap?: Space;
}

export function Flex({
  children,
  column,
  className,
  gap,
  justify,
  align,
  wrap,
  ...props
}: Props) {
  return (
    <div
      {...props}
      className={classNames(styles.flex, className)}
      data-column={column}
      data-wrap={wrap}
      data-gap={gap}
      data-justify={justify}
      data-align={align}
    >
      {children}
    </div>
  );
}
