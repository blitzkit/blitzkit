import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import "./index.css";

export interface ButtonProps extends ComponentProps<"button"> {
  color?: Color;
}

export function Button({ className, ...props }: ButtonProps) {
  return <button className={classNames("button", className)} {...props} />;
}
