import { classNames } from "../../ui/classNames";
import { Text, type TextProps } from "../Text";
import styles from "./index.module.css";

export interface HeadingProps extends Omit<TextProps, "size"> {
  size?: `${1 | 2 | 3 | 4 | 5 | 6}`;
}

export function Heading({
  className,
  weight,
  size = "1",
  ...props
}: HeadingProps) {
  return (
    <Text
      {...props}
      weight={weight ?? "medium"}
      className={classNames(styles.heading, className)}
      data-size={size}
    />
  );
}
