import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface ButtonProps extends ComponentProps<"button"> {}

export function Button({ className, ...props }: ButtonProps) {
  return <button className={classNames("button", className)} {...props} />;
}
