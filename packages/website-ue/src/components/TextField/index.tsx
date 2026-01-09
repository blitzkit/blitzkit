import type { ComponentProps, ReactNode } from "react";
import "./index.css";

export interface TextFieldProps extends ComponentProps<"input"> {
  children?: ReactNode;
}

export function TextField({ children, ...props }: TextFieldProps) {
  return (
    <div className="text-field" data-has-icon={children !== undefined}>
      {children}
      <input {...props} />
    </div>
  );
}
