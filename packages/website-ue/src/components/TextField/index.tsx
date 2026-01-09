import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface TextFieldProps extends ComponentProps<"input"> {
  children?: ReactNode;
}

export function TextField({ children, className, ...props }: TextFieldProps) {
  return (
    <div
      className={classNames("text-field", className)}
      data-has-icon={children !== undefined}
    >
      {children}
      <input {...props} />
    </div>
  );
}
