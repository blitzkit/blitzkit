import { classNames } from "../../core/ui/classNames";
import { Text, type TextProps } from "../Text";
import "./index.css";

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
      className={classNames("heading", className)}
      data-size={size}
    />
  );
}
