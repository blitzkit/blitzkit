import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { classNames } from "../../ui/classNames";
import styles from "./index.module.css";

export interface TextFieldProps extends Omit<ComponentProps<"input">, "size"> {
  children?: ReactNode;
  align?: "left" | "center" | "right";
  autoWidth?: boolean;
  variant?: "bubble" | "form";
  size?: "regular" | "minor";
  childrenAsSuffix?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      children,
      className,
      autoWidth,
      placeholder,
      align,
      disabled,
      value,
      variant = "bubble",
      size = "regular",
      childrenAsSuffix,
      ...props
    },
    ref,
  ) => {
    const input = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => input.current!, []);

    return (
      <div
        {...props}
        className={classNames(styles["text-field"], className)}
        data-has-icon={children !== undefined}
        data-disabled={disabled}
        data-variant={variant}
        data-size={size}
        data-has-suffix={childrenAsSuffix}
      >
        {!childrenAsSuffix && children}

        <input
          data-auto-width={autoWidth}
          data-align={align === "left" ? undefined : align}
          disabled={disabled}
          ref={input}
          placeholder={placeholder}
          value={value}
        />

        {childrenAsSuffix && children}
      </div>
    );
  },
);
