import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface TextFieldProps extends ComponentProps<"input"> {
  children?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ children, className, ...props }, ref) => {
    const input = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => input.current!, []);

    return (
      <div
        className={classNames("text-field", className)}
        data-has-icon={children !== undefined}
      >
        {children}
        <input ref={input} {...props} />
      </div>
    );
  }
);
